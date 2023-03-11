import { marked } from 'marked';

import { CodeMirror, CodeMirrorSpellChecker } from './codemirror/Codemirror.js';
import { MirageMDEMethods } from './mirage-mde.js';
import { Options, StatusBarItem, ToolbarItem } from './mirage-mde-types.js';
import {
	addAnchorTargetBlank,
	afterImageUploaded,
	bindings,
	createSep,
	createToolbarButton,
	createToolbarDropdown,
	fixShortcut,
	getState,
	humanFileSize,
	isMobile,
	removeListStyleWhenCheckbox,
	toggleFullScreen,
	toolbarBuiltInButtons,
	wordCount,
} from './mirage-mde-utilities.js';


// Safari, in Private Browsing Mode, looks like it supports localStorage but all calls to setItem throw QuotaExceededError. We're going to detect this and set a constiable accordingly.
const isLocalStorageAvailable = () => {
	if (typeof localStorage === 'object') {
		try {
			localStorage.setItem('smde_localStorage', String(1));
			localStorage.removeItem('smde_localStorage');
		}
		catch (e) {
			return false;
		}
	}
	else {
		return false;
	}

	return true;
};


export const autosave = function(this: MirageMDEMethods) {
	if (!isLocalStorageAvailable())
		return console.log('MirageMDE: localStorage not available, cannot autosave');

	const autosave = this.options.autosave;

	if (!autosave)
		return;
	if (autosave.uniqueId == undefined || autosave.uniqueId == '')
		return console.log('MirageMDE: You must set a uniqueId to use the autosave feature');


	if (autosave.binded !== true) {
		if (this.element.form != null && this.element.form != undefined) {
			this.element.form.addEventListener('submit', () => {
				clearTimeout(this.autosaveTimeoutId);
				this.autosaveTimeoutId = undefined;

				localStorage.removeItem('smde_' + autosave.uniqueId);
			});
		}

		autosave.binded = true;
	}

	if (autosave.loaded !== true) {
		if (typeof localStorage.getItem('smde_' + autosave.uniqueId) == 'string' && localStorage.getItem('smde_' + autosave.uniqueId) != '') {
			const value = localStorage.getItem('smde_' + autosave.uniqueId);
			value && this.codemirror.setValue(value);
			autosave.foundSavedValue = true;
		}

		autosave.loaded = true;
	}

	const value = this.value(undefined);
	if (typeof value === 'string') {
		if (value !== '')
			localStorage.setItem('smde_' + autosave.uniqueId, value);
		else
			localStorage.removeItem('smde_' + autosave.uniqueId);
	}
	else {
		localStorage.removeItem('smde_' + autosave.uniqueId);
	}

	const el = document.getElementById('autosaved');
	if (el) {
		const d = new Date();
		const dd = new Intl.DateTimeFormat(
			[ autosave.timeFormat?.locale ?? '', 'en-US' ].flat().filter(Boolean),
			autosave.timeFormat?.format,
		).format(d);

		const save = autosave.text == undefined
			? 'Autosaved: '
			: autosave.text;

		el.innerHTML = save + dd;
	}
};


/**
 * Upload asynchronously a list of images to a server.
 *
 * Can be triggered by:
 * - drag&drop;
 * - copy-paste;
 * - the browse-file window (opened when the user clicks on the *upload-image* icon).
 * @param {FileList} files The files to upload the the server.
 * @param [onSuccess] {function} see MirageMDE.prototype.uploadImage
 * @param [onError] {function} see MirageMDE.prototype.uploadImage
 */
export const uploadImages = function(this: MirageMDEMethods, files: FileList, onSuccess?: Function, onError?: Function) {
	if (files.length === 0)
		return;

	const names = [];
	for (let i = 0; i < files.length; i++) {
		names.push(files[i]!.name);
		this.uploadImage(files[i]!, onSuccess, onError);
	}

	this.updateStatusBar(
		'upload-image',
		this.options.imageTexts?.sbOnDrop
			?.replace('#images_names#', names.join(', ')) ?? '',
	);
};


/**
 * Upload asynchronously a list of images to a server.
 *
 * Can be triggered by:
 * - drag&drop;
 * - copy-paste;
 * - the browse-file window (opened when the user clicks on the *upload-image* icon).
 * @param imageUploadFunction {Function} The custom function to upload the image passed in options.
 * @param {FileList} files The files to upload the the server.
 */
export const uploadImagesUsingCustomFunction = function(this: MirageMDEMethods, imageUploadFunction: Function, files: FileList) {
	if (files.length === 0)
		return;

	const names = [];
	for (let i = 0; i < files.length; i++) {
		names.push(files[i]!.name);
		this.uploadImageUsingCustomFunction(imageUploadFunction, files[i]!);
	}
	this.updateStatusBar(
		'upload-image',
		this.options.imageTexts?.sbOnDrop
			?.replace('#images_names#', names.join(', ')) ?? '',
	);
};


/**
 * Upload an image to the server.
 *
 * @param file {File} The image to upload, as a HTML5 File object (https://developer.mozilla.org/en-US/docs/Web/API/File)
 * @param [onSuccess] {function} A callback function to execute after the image has been successfully uploaded, with one parameter:
 * - url (string): The URL of the uploaded image.
 * @param [onError] {function} A callback function to execute when the image upload fails, with one parameter:
 * - error (string): the detailed error to display to the user (based on messages from options.errorMessages).
 */
export const uploadImage = function(this: MirageMDEMethods, file: File, onSuccess?: Function, onError?: Function) {
	onSuccess ??= (imageUrl: string) => {
		afterImageUploaded(this, imageUrl);
	};

	const onErrorSup = (errorMessage: string) => {
		// show error on status bar and reset after 10000ms
		this.updateStatusBar('upload-image', errorMessage);

		setTimeout(() => {
			this.updateStatusBar('upload-image', this.options?.imageTexts?.sbInit ?? '');
		}, 10000);

		// run custom error handler
		if (onError && typeof onError === 'function')
			onError(errorMessage);

		// run error handler from options, this alerts the message.
		this.options.errorCallback?.(errorMessage);
	};

	const fillErrorMessage = (errorMessage: string) => {
		const { imageTexts, imageMaxSize = 0 } = this.options;
		if (!imageTexts)
			throw ('');

		const units = imageTexts?.sizeUnits?.split(',') ?? [];

		return errorMessage
			.replace('#image_name#', file.name)
			.replace('#image_size#', humanFileSize(file.size, units))
			.replace('#image_max_size#', humanFileSize(imageMaxSize, units));
	};

	if (file.size > (this.options?.imageMaxSize ?? 0)) {
		onErrorSup(fillErrorMessage(this.options?.errorMessages?.filesTooLarge ?? ''));

		return;
	}

	const formData = new FormData();
	formData.append('image', file);

	// insert CSRF body token if provided in config.
	if (this.options.imageCSRFToken && !this.options.imageCSRFHeader)
		formData.append(this.options?.imageCSRFName ?? '', this.options.imageCSRFToken);

	const request = new XMLHttpRequest();
	request.upload.onprogress = (event) => {
		if (event.lengthComputable) {
			const progress = '' + Math.round((event.loaded * 100) / event.total);

			this.updateStatusBar(
				'upload-image',
				(this.options?.imageTexts?.sbProgress ?? '')
					.replace('#file_name#', file.name).replace('#progress#', progress),
			);
		}
	};
	request.open('POST', this.options?.imageUploadEndpoint ?? '');

	// insert CSRF header token if provided in config.
	if (this.options.imageCSRFToken && this.options.imageCSRFHeader)
		request.setRequestHeader(this.options?.imageCSRFName ?? '', this.options.imageCSRFToken);

	request.onload = () => {
		let response: {
			data?: {
				filePath: string;
			};
			error?: string;
		};

		try {
			response = JSON.parse(request.responseText);
		}
		catch (error) {
			console.error('MirageMDE: The server did not return a valid json.');
			onErrorSup(fillErrorMessage(this.options.errorMessages!.importError!));

			return;
		}
		if (request.status === 200 && response && !response.error && response.data && response.data.filePath) {
			onSuccess?.((this.options.imagePathAbsolute ? '' : (window.location.origin + '/')) + response.data.filePath);
		}
		else {
			if (response.error && response.error in this.options.errorMessages!) {  // preformatted error message
				onErrorSup(fillErrorMessage(this.options.errorMessages?.[response.error] ?? ''));
			}
			else if (response.error) {  // server side generated error message
				onErrorSup(fillErrorMessage(response.error));
			}
			else {  //unknown error
				console.error('MirageMDE: Received an unexpected response after uploading the image.'
                    + request.status + ' (' + request.statusText + ')');

				onErrorSup(fillErrorMessage(this.options.errorMessages?.importError ?? ''));
			}
		}
	};

	request.onerror = (event) => {
		const target = event.target as XMLHttpRequest;

		console.error('MirageMDE: An unexpected error occurred when trying to upload the image.'
            + target.status + ' (' + target.statusText + ')');
		onErrorSup(this.options.errorMessages?.importError ?? '');
	};

	request.send(formData);
};


/**
 * Upload an image to the server using a custom upload function.
 *
 * @param imageUploadFunction {Function} The custom function to upload the image passed in options
 * @param file {File} The image to upload, as a HTML5 File object (https://developer.mozilla.org/en-US/docs/Web/API/File).
 */
export const uploadImageUsingCustomFunction = function(this: MirageMDEMethods, imageUploadFunction: Function, file: File) {
	const onSuccess = (imageUrl: string) => {
		afterImageUploaded(this, imageUrl);
	};

	const onError = (errorMessage: string) => {
		const filledErrorMessage = fillErrorMessage(errorMessage);
		// show error on status bar and reset after 10000ms
		this.updateStatusBar('upload-image', filledErrorMessage);

		setTimeout(() => {
			this.updateStatusBar('upload-image', this.options.imageTexts?.sbInit ?? '');
		}, 10000);

		// run error handler from options, this alerts the message.
		this.options.errorCallback?.(filledErrorMessage);
	};

	const fillErrorMessage = (errorMessage: string) => {
		const units = this.options.imageTexts?.sizeUnits?.split(',') ?? [];

		return errorMessage
			.replace('#image_name#', file.name)
			.replace('#image_size#', humanFileSize(file.size, units))
			.replace('#image_max_size#', humanFileSize(this.options.imageMaxSize ?? 0, units));
	};

	imageUploadFunction.apply(this, [ file, onSuccess, onError ]);
};


/**
 * Update an item in the status bar.
 * @param itemName {string} The name of the item to update (ie. 'upload-image', 'autosave', etc.).
 * @param content {string} the new content of the item to write in the status bar.
 */
export const updateStatusBar = function(this: MirageMDEMethods, itemName: string, content: string) {
	if (!this.gui.statusbar)
		return;

	const matchingClasses = this.gui.statusbar.getElementsByClassName(itemName);
	if (matchingClasses.length === 1)
		matchingClasses[0]!.textContent = content;
	else if (matchingClasses.length === 0)
		console.log('MirageMDE: status bar item ' + itemName + ' was not found.');
	else
		console.log('MirageMDE: Several status bar items named ' + itemName + ' was found.');
};


/**
 * Default markdown render.
 */
export const markdown = function(this: MirageMDEMethods, text: string) {
	if (!marked)
		return;

	// Initialize
	let markedOptions;
	if (this.options && this.options.renderingConfig && this.options.renderingConfig.markedOptions)
		markedOptions = this.options.renderingConfig.markedOptions;
	else
		markedOptions = {};

	// Update options
	if (this.options && this.options.renderingConfig && this.options.renderingConfig.singleLineBreaks === false)
		markedOptions.breaks = false;
	else
		markedOptions.breaks = true;

	if (this.options && this.options.renderingConfig && this.options.renderingConfig.codeSyntaxHighlighting === true) {
		/* Get HLJS from config or window */
		const hljs = this.options.renderingConfig.hljs || (window as any).hljs;

		/* Check if HLJS loaded */
		if (hljs) {
			markedOptions.highlight = function(code, language) {
				if (language && hljs.getLanguage(language))
					return hljs.highlight(language, code).value;
				else
					return hljs.highlightAuto(code).value;
			};
		}
	}

	// Set options
	marked.setOptions(markedOptions);

	// Convert the markdown to HTML
	let htmlText = marked.parse(text);

	// Sanitize HTML
	if (this.options.renderingConfig && typeof this.options.renderingConfig.sanitizerFunction === 'function')
		htmlText = this.options.renderingConfig.sanitizerFunction.call(this, htmlText);


	// Edit the HTML anchors to add 'target="_blank"' by default.
	htmlText = addAnchorTargetBlank(htmlText);

	// Remove list-style when rendering checkboxes
	htmlText = removeListStyleWhenCheckbox(htmlText);

	return htmlText;
};


/**
 * Render editor to the given element.
 */
export const render = function(this: MirageMDEMethods, el?: HTMLTextAreaElement) {
	el ??= this.element || document.getElementsByTagName('textarea')[0]!;

	// If already rendered.
	if (this._rendered === el)
		return;

	this.element = el;
	const options = this.options;

	const keyMaps: CodeMirror.KeyMap = {};

	for (let key in options.shortcuts) {
		// null stands for "do not bind this command"
		if (options.shortcuts[key] !== null && bindings[key] !== null) {
			((key) => {
				keyMaps[fixShortcut(options.shortcuts[key] ?? '')] = () => {
					const action = bindings[key];
					if (typeof action === 'function')
						action(this);
					else if (typeof action === 'string')
						window.open(action, '_blank');
				};
			})(key);
		}
	}

	keyMaps['Enter'] = 'newlineAndIndentContinueMarkdownList';
	keyMaps['Tab'] = 'tabAndIndentMarkdownList';
	keyMaps['Shift-Tab'] = 'shiftTabAndUnindentMarkdownList';
	keyMaps['Esc'] = (cm: CodeMirror.Editor) => void cm.getOption('fullScreen') && toggleFullScreen(this);

	this.documentOnKeyDown = (ev: KeyboardEvent) => {
		ev = ev || window.event;

		if (ev.keyCode == 27) {
			if (this.codemirror.getOption('fullScreen'))
				toggleFullScreen(this);
		}
	};
	document.addEventListener('keydown', this.documentOnKeyDown, false);

	let mode: string | CodeMirror.ModeSpec<CodeMirror.ModeSpecOptions> | undefined;
	let backdrop;

	// CodeMirror overlay mode
	if (options.overlayMode) {
		CodeMirror.defineMode('overlay-mode', (config) => {
			const baseMode = CodeMirror.getMode(config, options.spellChecker !== false ? 'spell-checker' : 'gfm');
			const overlayMode = options.overlayMode?.mode;
			const combineMode = options.overlayMode?.combine;

			if (!(baseMode && overlayMode && combineMode))
				throw ('MirageMDE: could not defined modes');

			return CodeMirror.overlayMode(baseMode, overlayMode, combineMode);
		});

		mode = 'overlay-mode';
		backdrop = options.parsingConfig!;
		backdrop.gitHubSpice = false;
	}
	else {
		mode = options.parsingConfig! as CodeMirror.ModeSpec<CodeMirror.ModeSpecOptions>;
		mode.name = 'gfm';
		mode.gitHubSpice = false;
	}
	if (options.spellChecker !== false) {
		mode = 'spell-checker';
		backdrop = options.parsingConfig!;
		backdrop.name = 'gfm';
		backdrop.gitHubSpice = false;

		if (typeof options.spellChecker === 'function') {
			options.spellChecker({
				codeMirrorInstance: CodeMirror,
			});
		}
		else {
			CodeMirrorSpellChecker({
				codeMirrorInstance: CodeMirror,
			});
		}
	}

	const configureMouse = (
		_cm: CodeMirror.Editor,
		_repeat: 'single' | 'double' | 'triple',
		_event: Event,
	) => ({
		addNew: false,
	});

	this.codemirror = CodeMirror.fromTextArea(el, {
		backdrop:           backdrop, // This does not actually belong in this type, for some reason.
		mode:               mode,
		theme:              (options.theme != undefined) ? options.theme : 'MirageMDE',
		tabSize:            (options.tabSize != undefined) ? options.tabSize : 2,
		indentUnit:         (options.tabSize != undefined) ? options.tabSize : 2,
		indentWithTabs:     (options.indentWithTabs === false) ? false : true,
		lineNumbers:        (options.lineNumbers === true) ? true : false,
		autofocus:          (options.autofocus === true) ? true : false,
		extraKeys:          keyMaps,
		direction:          options.direction,
		lineWrapping:       (options.lineWrapping === false) ? false : true,
		allowDropFileTypes: [ 'text/plain' ],
		placeholder:        options.placeholder || el.getAttribute('placeholder') || '',
		styleSelectedText:  (options.styleSelectedText != undefined) ? options.styleSelectedText : !isMobile(),
		scrollbarStyle:     (options.scrollbarStyle != undefined) ? options.scrollbarStyle : 'native',
		configureMouse:     configureMouse,
		inputStyle:         (options.inputStyle != undefined) ? options.inputStyle : isMobile() ? 'contenteditable' : 'textarea',
		spellcheck:         (options.nativeSpellcheck != undefined) ? options.nativeSpellcheck : true,
		autoRefresh:        (options.autoRefresh != undefined) ? options.autoRefresh : false,
	} as CodeMirror.EditorConfiguration);

	this.codemirror.getScrollerElement().style.minHeight = options.minHeight ?? '';

	if (typeof options.maxHeight !== 'undefined')
		this.codemirror.getScrollerElement().style.height = options.maxHeight;

	if (options.forceSync === true) {
		const cm = this.codemirror;
		cm.on('change', () => {
			(cm as any).save();
		});
	}

	this.gui = {} as any;

	// Wrap Codemirror with container before create toolbar, etc,
	// to use with sideBySideFullscreen option.
	const mdeContainer = document.createElement('div');
	mdeContainer.classList.add('mirage-mde-container');
	mdeContainer.setAttribute('role', 'application');
	const cmWrapper = this.codemirror.getWrapperElement();
	cmWrapper.parentNode?.insertBefore(mdeContainer, cmWrapper);
	mdeContainer.appendChild(cmWrapper);

	if (options.toolbar !== false)
		this.gui.toolbar = this.createToolbar()!;

	if (options.status !== false)
		this.gui.statusbar = this.createStatusbar()!;

	if (options.autosave != undefined && options.autosave.enabled === true) {
		this.autosave(); // use to load localstorage content
		this.codemirror.on('change', () => {
			clearTimeout(this._autosave_timeout);
			this._autosave_timeout = setTimeout(() => {
				this.autosave();
			}, this.options?.autosave?.submit_delay || this.options?.autosave?.delay || 1000);
		});
	}

	const calcHeight = (naturalWidth: number, naturalHeight: number) => {
		let height;
		const viewportWidth = parseInt(window.getComputedStyle(document.querySelector('.CodeMirror-sizer')!)
			.width.replace('px', ''));

		if (naturalWidth < viewportWidth)
			height = naturalHeight + 'px';
		else
			height = (naturalHeight / naturalWidth * 100) + '%';

		return height;
	};

	const assignImageBlockAttributes = (
		parentEl: HTMLElement,
		img: {
			url: string;
			naturalWidth: number;
			naturalHeight: number;
		},
	) => {
		parentEl.setAttribute('data-img-src', img.url);
		parentEl.setAttribute(
			'style',
			`--bg-image:url(${ img.url });` +
			`--width:${ img.naturalWidth }px;` +
			`--height:${ calcHeight(img.naturalWidth, img.naturalHeight) }`,
		);
		this.codemirror.setSize(null, null);
	};

	const handleImages = () => {
		if (!options.previewImagesInEditor)
			return;

		mdeContainer.querySelectorAll('.cm-image-marker').forEach((e) => {
			const parentEl = e.parentElement;
			if (!parentEl)
				return;

			// if img pasted on the same line with other text, don't preview, preview only images on separate line
			if (!parentEl.innerText.match(/^!\[.*?\]\(.*\)/g))
				return;

			if (!parentEl.hasAttribute('data-img-src')) {
				const srcAttr = parentEl.innerText.match('\\((.*)\\)'); // might require better parsing according to markdown spec
				const _window = window as typeof window & {EMDEimagesCache: Record<string, any>;};

				if (!_window.EMDEimagesCache)
					_window.EMDEimagesCache = {};

				if (srcAttr && srcAttr.length >= 2) {
					let keySrc = srcAttr[1]!;

					if (options.imagesPreviewHandler) {
						const newSrc = options.imagesPreviewHandler(keySrc);
						// defensive check making sure the handler provided by the user returns a string
						if (typeof newSrc === 'string')
							keySrc = newSrc;
					}

					if (!_window.EMDEimagesCache[keySrc]) {
						const img = document.createElement('img');
						img.onload = function() {
							_window.EMDEimagesCache[keySrc] = {
								naturalWidth:  img.naturalWidth,
								naturalHeight: img.naturalHeight,
								url:           keySrc,
							};
							assignImageBlockAttributes(parentEl, _window.EMDEimagesCache[keySrc]);
						};
						img.src = keySrc;
					}
					else {
						assignImageBlockAttributes(parentEl, _window.EMDEimagesCache[keySrc]);
					}
				}
			}
		});
	};

	this.codemirror.on('update', () => void handleImages());

	this.gui.sideBySide = this.createSideBySide();
	this._rendered = this.element;

	if (options.autofocus === true || el.autofocus)
		this.codemirror.focus();

	// Fixes CodeMirror bug (#344)
	const temp_cm = this.codemirror;
	setTimeout((() => {
		temp_cm.refresh();
	}).bind(temp_cm), 0);
};


export const createToolbar = function(this: MirageMDEMethods, items?: Options['toolbar']) {
	items = items || this.options.toolbar;

	if (!items || items === true || items.length === 0)
		return;

	let i;
	for (i = 0; i < items.length; i++) {
		const item = items[i];
		if (typeof item === 'string') {
			if (toolbarBuiltInButtons[item] != undefined) {
				const res = toolbarBuiltInButtons[item] as ToolbarItem;
				items[i] = res;
			}
		}
	}

	const bar = document.createElement('div');
	bar.className = 'editor-toolbar';
	bar.setAttribute('role', 'toolbar');

	const toolbarData: Record<string, HTMLElement> = {};
	this.toolbar = items;

	for (i = 0; i < this.toolbar.length; i++) {
		const toolbarItem = this.toolbar[i];
		if (typeof toolbarItem === 'object') {
			if (toolbarItem.name == 'guide' && this.options.toolbarGuideIcon === false)
				continue;

			if (this.options.hideIcons && this.options.hideIcons.indexOf(toolbarItem.name) != -1)
				continue;

			// Fullscreen does not work well on mobile devices (even tabconsts)
			// In the future, hopefully this can be resolved
			if ((toolbarItem.name == 'fullscreen' || toolbarItem.name == 'side-by-side') && isMobile())
				continue;
		}

		if (typeof toolbarItem === 'string') {
			// Don't include trailing separators
			if (toolbarItem === '|') {
				let nonSeparatorIconsFollow = false;

				for (let x = (i + 1); x < items.length; x++) {
					const item = items[x]!;
					if (item !== '|' && (!this.options.hideIcons || this.options.hideIcons.indexOf((item as any).name) == -1))
						nonSeparatorIconsFollow = true;
				}

				if (!nonSeparatorIconsFollow)
					continue;
			}
		}


		// Create the icon and append to the toolbar
		((item) => {
			let el;
			if (item === '|')
				el = createSep();
			else if ((item as any).children)
				el = createToolbarDropdown(item, this.options.toolbarTips, this.options.shortcuts as any, this);
			else
				el = createToolbarButton(item, true, !!this.options.toolbarTips, this.options.shortcuts as any, 'button', this);

			const name = typeof item === 'string' ? item : item!.name;

			toolbarData[name] = el;
			bar.appendChild(el);

			if (typeof item === 'object') {
				// Create the input element (ie. <input type='file'>), used among
				// with the 'import-image' icon to open the browse-file window.
				if (item.name === 'upload-image') {
					const imageInput = document.createElement('input');
					imageInput.className = 'imageInput';
					imageInput.type = 'file';
					imageInput.multiple = true;
					imageInput.name = 'image';
					imageInput.accept = this.options.imageAccept!;
					imageInput.style.display = 'none';
					imageInput.style.opacity = '0';
					bar.appendChild(imageInput);
				}
			}
		})(items[i]);
	}

	this.toolbar_div = bar;
	this.toolbarElements = toolbarData;

	const cm = this.codemirror;
	cm.on('cursorActivity', () => {
		const stat = getState(cm);

		for (let key in toolbarData) {
			((key) => {
				const el = toolbarData[key];
				if (el) {
					if (stat[key])
						el.classList.add('active');
					else if (key != 'fullscreen' && key != 'side-by-side')
						el.classList.remove('active');
				}
			})(key);
		}
	});

	const cmWrapper = cm.getWrapperElement();
	cmWrapper.parentNode?.insertBefore(bar, cmWrapper);

	return bar;
};


export const createStatusbar = function(this: MirageMDEMethods, status?: boolean | (string | StatusBarItem)[]) {
	// Initialize
	status = status || this.options.status;
	const options = this.options;
	const cm = this.codemirror;

	// Make sure the status constiable is valid
	if (!status || (status !== true && status.length === 0) || status === true)
		return;

	// Set up the built-in items
	const items = [];
	let i;
	let onUpdate;
	let onActivity;
	let defaultValue;

	for (i = 0; i < status.length; i++) {
		// Reset some values
		onUpdate = undefined;
		onActivity = undefined;
		defaultValue = undefined;

		// Handle if custom or not
		const item = status[i]!;
		if (typeof item === 'object') {
			items.push({
				className:    item.className,
				defaultValue: item.defaultValue,
				onUpdate:     item.onUpdate,
				onActivity:   item.onActivity,
			});
		}
		else {
			const name = item;

			if (name === 'words') {
				defaultValue = (el: HTMLElement) => {
					el.innerHTML = String(wordCount(cm.getValue()));
				};
				onUpdate = (el: HTMLElement) => {
					el.innerHTML = String(wordCount(cm.getValue()));
				};
			}
			else if (name === 'lines') {
				defaultValue = (el: HTMLElement) => {
					el.innerHTML = String(cm.lineCount());
				};
				onUpdate = (el: HTMLElement) => {
					el.innerHTML = String(cm.lineCount());
				};
			}
			else if (name === 'cursor') {
				defaultValue = (el: HTMLElement) => {
					el.innerHTML = '1:1';
				};
				onActivity = (el: HTMLElement) => {
					const pos = cm.getCursor();
					const posLine = pos.line + 1;
					const posColumn = pos.ch + 1;
					el.innerHTML = posLine + ':' + posColumn;
				};
			}
			else if (name === 'autosave') {
				defaultValue = (el: HTMLElement) => {
					if (options.autosave != undefined && options.autosave.enabled === true)
						el.setAttribute('id', 'autosaved');
				};
			}
			else if (name === 'upload-image') {
				defaultValue = (el: HTMLElement) => {
					el.innerHTML = options.imageTexts?.sbInit ?? '';
				};
			}

			items.push({
				className:    name,
				defaultValue: defaultValue,
				onUpdate:     onUpdate,
				onActivity:   onActivity,
			});
		}
	}

	// Create element for the status bar
	const bar = document.createElement('div');
	bar.className = 'editor-statusbar';

	// Create a new span for each item
	for (i = 0; i < items.length; i++) {
		// Store in temporary constiable
		const item = items[i]!;

		// Create span element
		const el = document.createElement('span');
		el.className = item.className;

		// Ensure the defaultValue is a function
		if (typeof item.defaultValue === 'function')
			item.defaultValue(el);

		// Ensure the onUpdate is a function
		if (typeof item.onUpdate === 'function') {
			// Create a closure around the span of the current action, then execute the onUpdate handler
			this.codemirror.on('update', () => item.onUpdate?.(el));
		}
		if (typeof item.onActivity === 'function') {
			// Create a closure around the span of the current action, then execute the onActivity handler
			this.codemirror.on('cursorActivity', () => item.onActivity?.(el));
		}

		// Append the item to the status bar
		bar.appendChild(el);
	}


	// Insert the status bar into the DOM
	const cmWrapper = this.codemirror.getWrapperElement();
	cmWrapper.parentNode?.insertBefore(bar, cmWrapper.nextSibling);

	return bar;
};


export const createSideBySide = function(this: MirageMDEMethods) {
	const cm = this.codemirror;
	const wrapper = cm.getWrapperElement();
	let preview = wrapper.nextElementSibling as HTMLElement;

	if (!preview || !preview.classList.contains('editor-preview-side')) {
		preview = document.createElement('div');
		preview.className = 'editor-preview-side';

		if (this.options.previewClass) {
			if (Array.isArray(this.options.previewClass)) {
				for (let i = 0; i < this.options.previewClass.length; i++)
					preview.classList.add(this.options.previewClass[i]);
			}
			else if (typeof this.options.previewClass === 'string') {
				preview.classList.add(this.options.previewClass);
			}
		}

		wrapper.parentNode?.insertBefore(preview, wrapper.nextSibling);
	}

	if (typeof this.options.maxHeight !== 'undefined')
		this.setPreviewMaxHeight();


	if (this.options.syncSideBySidePreviewScroll === false)
		return preview;

	// Syncs scroll  editor -> preview
	let cScroll = false;
	let pScroll = false;
	cm.on('scroll', (v) => {
		if (cScroll) {
			cScroll = false;

			return;
		}

		pScroll = true;
		const height = v.getScrollInfo().height - v.getScrollInfo().clientHeight;
		const ratio = parseFloat(String(v.getScrollInfo().top)) / height;
		const move = (preview!.scrollHeight - preview!.clientHeight) * ratio;
		preview!.scrollTop = move;
	});

	// Syncs scroll  preview -> editor
	preview.onscroll = function() {
		if (pScroll) {
			pScroll = false;

			return;
		}

		cScroll = true;
		const height = preview.scrollHeight - preview.clientHeight;
		const ratio = parseFloat(String(preview.scrollTop)) / height;
		const move = (cm.getScrollInfo().height - cm.getScrollInfo().clientHeight) * ratio;
		cm.scrollTo(0, move);
	};

	return preview;
};


export const setPreviewMaxHeight = function(this: MirageMDEMethods) {
	const cm = this.codemirror;
	const wrapper = cm.getWrapperElement();
	let preview = wrapper.nextElementSibling as HTMLElement;

	// Calc preview max height
	const paddingTop = parseInt(window.getComputedStyle(wrapper).paddingTop);
	const borderTopWidth = parseInt(window.getComputedStyle(wrapper).borderTopWidth);
	const optionsMaxHeight = parseInt(this.options?.maxHeight ?? '0');
	const wrapperMaxHeight = optionsMaxHeight + paddingTop * 2 + borderTopWidth * 2;
	const previewMaxHeight = wrapperMaxHeight.toString() + 'px';

	preview.style.height = previewMaxHeight;
};


export const cleanup = function(this: MirageMDEMethods) {
	document.removeEventListener('keydown', this.documentOnKeyDown);
};


export const clearAutosavedValue = function(this: MirageMDEMethods) {
	if (isLocalStorageAvailable()) {
		if (this.options.autosave == undefined || this.options.autosave.uniqueId == undefined || this.options.autosave.uniqueId == '') {
			console.log('MirageMDE: You must set a uniqueId to clear the autosave value');

			return;
		}

		localStorage.removeItem('smde_' + this.options.autosave.uniqueId);
	}
	else {
		console.log('MirageMDE: localStorage not available, cannot autosave');
	}
};


/**
 * Open the browse-file window to upload an image to a server.
 * @param [onSuccess] {function} see MirageMDE.prototype.uploadImage
 * @param [onError] {function} see MirageMDE.prototype.uploadImage
 */
export const openBrowseFileWindow = function(this: MirageMDEMethods, onSuccess?: Function, onError?: Function) {
	const imageInput = this.gui.toolbar.getElementsByClassName('imageInput')[0]! as HTMLElement;
	imageInput.click(); //dispatchEvent(new MouseEvent('click'));  // replaced with click() for IE11 compatibility.

	const onChange = (event: Event) => {
		const target = event.target as any;

		if (this.options.imageUploadFunction)
			this.uploadImagesUsingCustomFunction(this.options.imageUploadFunction, target.files);
		else
			this.uploadImages(target.files, onSuccess, onError);

		imageInput.removeEventListener('change', onChange);
	};

	imageInput.addEventListener('change', onChange);
};

/**
 * Get or set the text content.
 */
export const value = function(this: MirageMDEMethods, val?: string): MirageMDEMethods | string {
	const cm = this.codemirror;
	if (val === undefined) {
		return cm.getValue() as any;
	}
	else {
		cm.getDoc().setValue(val);
		if (this.isPreviewActive()) {
			const wrapper = cm.getWrapperElement();
			let preview = wrapper.lastElementChild as HTMLElement;
			const preview_result = this.options.previewRender?.(val, preview);
			preview.innerHTML = preview_result ?? '';
		}

		return this as any;
	}
};
