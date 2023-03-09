import CodeMirror, { Editor, KeyMap, ModeSpec, ModeSpecOptions } from 'codemirror';
// @ts-expect-error
import CodeMirrorSpellChecker from 'codemirror-spell-checker';
import { marked } from 'marked';

import { EasyMDE2 } from './EasyMDE2.js';
import { addAnchorTargetBlank, afterImageUploaded, bindings, createSep, createToolbarButton, createToolbarDropdown, fixShortcut, getState, humanFileSize, isMobile, removeListStyleWhenCheckbox, toggleFullScreen, toolbarBuiltInButtons } from './main.js';
import { Options, ToolbarItem } from './types.js';


// Safari, in Private Browsing Mode, looks like it supports localStorage but all calls to setItem throw QuotaExceededError. We're going to detect this and set a constiable accordingly.
function isLocalStorageAvailable() {
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
}


export const autosave = function(this: EasyMDE2) {
	if (!isLocalStorageAvailable())
		return console.log('EasyMDE: localStorage not available, cannot autosave');

	const autosave = this.options.autosave;

	if (!autosave)
		return;
	if (autosave.uniqueId == undefined || autosave.uniqueId == '')
		return console.log('EasyMDE: You must set a uniqueId to use the autosave feature');


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

	const value = this.value();
	if (value !== '')
		localStorage.setItem('smde_' + autosave.uniqueId, value);
	else
		localStorage.removeItem('smde_' + autosave.uniqueId);

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
 * @param [onSuccess] {function} see EasyMDE.prototype.uploadImage
 * @param [onError] {function} see EasyMDE.prototype.uploadImage
 */
export const uploadImages = function(this: EasyMDE2, files: FileList, onSuccess?: Function, onError?: Function) {
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
export const uploadImagesUsingCustomFunction = function(this: EasyMDE2, imageUploadFunction: Function, files: FileList) {
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
export const uploadImage = function(this: EasyMDE2, file: File, onSuccess?: Function, onError?: Function) {
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
			console.error('EasyMDE: The server did not return a valid json.');
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
				console.error('EasyMDE: Received an unexpected response after uploading the image.'
                    + request.status + ' (' + request.statusText + ')');

				onErrorSup(fillErrorMessage(this.options.errorMessages?.importError ?? ''));
			}
		}
	};

	request.onerror = (event) => {
		const target = event.target as XMLHttpRequest;

		console.error('EasyMDE: An unexpected error occurred when trying to upload the image.'
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
export const uploadImageUsingCustomFunction = function(this: EasyMDE2, imageUploadFunction: Function, file: File) {
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
export const updateStatusBar = function(this: EasyMDE2, itemName: string, content: string) {
	if (!this.gui.statusbar)
		return;

	const matchingClasses = this.gui.statusbar.getElementsByClassName(itemName);
	if (matchingClasses.length === 1)
		matchingClasses[0]!.textContent = content;
	else if (matchingClasses.length === 0)
		console.log('EasyMDE: status bar item ' + itemName + ' was not found.');
	else
		console.log('EasyMDE: Several status bar items named ' + itemName + ' was found.');
};


/**
 * Default markdown render.
 */
export const markdown = function(this: EasyMDE2, text: string) {
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
export const render = function(this: EasyMDE2, el: HTMLTextAreaElement) {
	if (!el)
		el = this.element || document.getElementsByTagName('textarea')[0];

	// If already rendered.
	if (this._rendered === el)
		return;

	this.element = el;
	const options = this.options;

	const keyMaps: KeyMap = {};

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
	keyMaps['Esc'] = (cm: Editor) => {
		if (cm.getOption('fullScreen'))
			toggleFullScreen(this);
	};

	this.documentOnKeyDown = (ev: KeyboardEvent) => {
		ev = ev || window.event;

		if (ev.keyCode == 27) {
			if (this.codemirror.getOption('fullScreen'))
				toggleFullScreen(this);
		}
	};
	document.addEventListener('keydown', this.documentOnKeyDown, false);

	let mode: string | ModeSpec<ModeSpecOptions> | undefined;
	let backdrop;

	// CodeMirror overlay mode
	if (options.overlayMode) {
		CodeMirror.defineMode('overlay-mode', (config) => {
			const baseMode = CodeMirror.getMode(config, options.spellChecker !== false ? 'spell-checker' : 'gfm');
			const overlayMode = options.overlayMode?.mode;
			const combineMode = options.overlayMode?.combine;

			if (!(baseMode && overlayMode && combineMode))
				throw ('EasyMDE: could not defined modes');

			return CodeMirror.overlayMode(baseMode, overlayMode, combineMode);
		});

		mode = 'overlay-mode';
		backdrop = options.parsingConfig!;
		backdrop.gitHubSpice = false;
	}
	else {
		mode = options.parsingConfig! as ModeSpec<ModeSpecOptions>;
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
				codeMirrorInstance: this.codemirror,
			});
		}
		else {
			CodeMirrorSpellChecker({
				codeMirrorInstance: this.codemirror,
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
		theme:              (options.theme != undefined) ? options.theme : 'easymde',
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
	const easyMDEContainer = document.createElement('div');
	easyMDEContainer.classList.add('EasyMDEContainer');
	easyMDEContainer.setAttribute('role', 'application');
	const cmWrapper = this.codemirror.getWrapperElement();
	cmWrapper.parentNode?.insertBefore(easyMDEContainer, cmWrapper);
	easyMDEContainer.appendChild(cmWrapper);

	if (options.toolbar !== false)
		this.gui.toolbar = this.createToolbar();

	if (options.status !== false)
		this.gui.statusbar = this.createStatusbar();

	if (options.autosave != undefined && options.autosave.enabled === true) {
		this.autosave(); // use to load localstorage content
		this.codemirror.on('change', () => {
			clearTimeout(this._autosave_timeout);
			this._autosave_timeout = setTimeout(() => {
				this.autosave();
			}, this.options?.autosave?.submit_delay || this.options?.autosave?.delay || 1000);
		});
	}

	function calcHeight(naturalWidth, naturalHeight) {
		let height;
		const viewportWidth = window.getComputedStyle(document.querySelector('.CodeMirror-sizer')).width.replace('px', '');
		if (naturalWidth < viewportWidth)
			height = naturalHeight + 'px';
		else
			height = (naturalHeight / naturalWidth * 100) + '%';

		return height;
	}

	const _vm = this;


	function assignImageBlockAttributes(parentEl, img) {
		parentEl.setAttribute('data-img-src', img.url);
		parentEl.setAttribute('style', '--bg-image:url(' + img.url + ');--width:' + img.naturalWidth + 'px;--height:' + calcHeight(img.naturalWidth, img.naturalHeight));
		_vm.codemirror.setSize();
	}

	function handleImages() {
		if (!options.previewImagesInEditor)
			return;

		easyMDEContainer.querySelectorAll('.cm-image-marker').forEach((e) => {
			const parentEl = e.parentElement;
			if (!parentEl.innerText.match(/^!\[.*?\]\(.*\)/g)) {
				// if img pasted on the same line with other text, don't preview, preview only images on separate line
				return;
			}
			if (!parentEl.hasAttribute('data-img-src')) {
				const srcAttr = parentEl.innerText.match('\\((.*)\\)'); // might require better parsing according to markdown spec
				if (!window.EMDEimagesCache)
					window.EMDEimagesCache = {};


				if (srcAttr && srcAttr.length >= 2) {
					let keySrc = srcAttr[1];

					if (options.imagesPreviewHandler) {
						const newSrc = options.imagesPreviewHandler(srcAttr[1]);
						// defensive check making sure the handler provided by the user returns a string
						if (typeof newSrc === 'string')
							keySrc = newSrc;
					}

					if (!window.EMDEimagesCache[keySrc]) {
						const img = document.createElement('img');
						img.onload = function() {
							window.EMDEimagesCache[keySrc] = {
								naturalWidth:  img.naturalWidth,
								naturalHeight: img.naturalHeight,
								url:           keySrc,
							};
							assignImageBlockAttributes(parentEl, window.EMDEimagesCache[keySrc]);
						};
						img.src = keySrc;
					}
					else {
						assignImageBlockAttributes(parentEl, window.EMDEimagesCache[keySrc]);
					}
				}
			}
		});
	}

	this.codemirror.on('update', () => {
		handleImages();
	});

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


export const createToolbar = function(this: EasyMDE2, items: Options['toolbar']) {
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
					if (items[x] !== '|' && (!this.options.hideIcons || this.options.hideIcons.indexOf(items[x].name) == -1))
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
				el = createToolbarButton(item, true, this.options.toolbarTips, this.options.shortcuts as any, 'button', this);

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
			(function(key) {
				const el = toolbarData[key];
				if (stat[key])
					el.classList.add('active');
				else if (key != 'fullscreen' && key != 'side-by-side')
					el.classList.remove('active');
			})(key);
		}
	});

	const cmWrapper = cm.getWrapperElement();
	cmWrapper.parentNode?.insertBefore(bar, cmWrapper);

	return bar;
};


export const createStatusbar = function(this: EasyMDE2, status) {
	// Initialize
	status = status || this.options.status;
	const options = this.options;
	const cm = this.codemirror;

	// Make sure the status constiable is valid
	if (!status || status.length === 0)
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
		if (typeof status[i] === 'object') {
			items.push({
				className:    status[i].className,
				defaultValue: status[i].defaultValue,
				onUpdate:     status[i].onUpdate,
				onActivity:   status[i].onActivity,
			});
		}
		else {
			const name = status[i];

			if (name === 'words') {
				defaultValue = function(el) {
					el.innerHTML = wordCount(cm.getValue());
				};
				onUpdate = function(el) {
					el.innerHTML = wordCount(cm.getValue());
				};
			}
			else if (name === 'lines') {
				defaultValue = function(el) {
					el.innerHTML = cm.lineCount();
				};
				onUpdate = function(el) {
					el.innerHTML = cm.lineCount();
				};
			}
			else if (name === 'cursor') {
				defaultValue = function(el) {
					el.innerHTML = '1:1';
				};
				onActivity = function(el) {
					const pos = cm.getCursor();
					const posLine = pos.line + 1;
					const posColumn = pos.ch + 1;
					el.innerHTML = posLine + ':' + posColumn;
				};
			}
			else if (name === 'autosave') {
				defaultValue = function(el) {
					if (options.autosave != undefined && options.autosave.enabled === true)
						el.setAttribute('id', 'autosaved');
				};
			}
			else if (name === 'upload-image') {
				defaultValue = function(el) {
					el.innerHTML = options.imageTexts.sbInit;
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
		const item = items[i];


		// Create span element
		const el = document.createElement('span');
		el.className = item.className;


		// Ensure the defaultValue is a function
		if (typeof item.defaultValue === 'function')
			item.defaultValue(el);


		// Ensure the onUpdate is a function
		if (typeof item.onUpdate === 'function') {
			// Create a closure around the span of the current action, then execute the onUpdate handler
			this.codemirror.on('update', (function(el, item) {
				return function() {
					item.onUpdate(el);
				};
			}(el, item)));
		}
		if (typeof item.onActivity === 'function') {
			// Create a closure around the span of the current action, then execute the onActivity handler
			this.codemirror.on('cursorActivity', (function(el, item) {
				return function() {
					item.onActivity(el);
				};
			}(el, item)));
		}


		// Append the item to the status bar
		bar.appendChild(el);
	}


	// Insert the status bar into the DOM
	const cmWrapper = this.codemirror.getWrapperElement();
	cmWrapper.parentNode.insertBefore(bar, cmWrapper.nextSibling);

	return bar;
};


export const createSideBySide = function(this: EasyMDE2) {
	const cm = this.codemirror;
	const wrapper = cm.getWrapperElement();
	let preview = wrapper.nextSibling;

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

		wrapper.parentNode.insertBefore(preview, wrapper.nextSibling);
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
		const ratio = parseFloat(v.getScrollInfo().top) / height;
		const move = (preview.scrollHeight - preview.clientHeight) * ratio;
		preview.scrollTop = move;
	});

	// Syncs scroll  preview -> editor
	preview.onscroll = function() {
		if (pScroll) {
			pScroll = false;

			return;
		}

		cScroll = true;
		const height = preview.scrollHeight - preview.clientHeight;
		const ratio = parseFloat(preview.scrollTop) / height;
		const move = (cm.getScrollInfo().height - cm.getScrollInfo().clientHeight) * ratio;
		cm.scrollTo(0, move);
	};

	return preview;
};
