import { CodeMirror } from './codemirror/Codemirror.js';
import {
	autosave, cleanup, clearAutosavedValue, createSideBySide, createStatusbar,
	createToolbar, markdown, openBrowseFileWindow, render, setPreviewMaxHeight,
	updateStatusBar, uploadImage, uploadImages,
	uploadImagesUsingCustomFunction, uploadImageUsingCustomFunction, value,
} from './mirage-mde-methods.js';
import { Options, ToolbarItem } from './mirage-mde-types.js';
import {
	blockStyles, cleanBlock, drawHorizontalRule, drawImage,
	drawLink, drawTable, drawUploadedImage, errorMessages, extend,
	getState,
	iconClassMap, imageTexts, insertTexts, promptTexts, redo, Shortcuts, shortcuts,
	timeFormat, toggleBlockquote, toggleBold, toggleCodeBlock, toggleFullScreen,
	toggleHeading1, toggleHeading2, toggleHeading3, toggleHeading4, toggleHeading5,
	toggleHeading6, toggleHeadingBigger, toggleHeadingSmaller, toggleItalic,
	toggleOrderedList, togglePreview, toggleSideBySide, toggleStrikethrough,
	toggleUnorderedList, toolbarBuiltInButtons, undo,
} from './mirage-mde-utilities.js';


class MirageMDEStatic {

	/**
	 * Bind static methods for exports.
	 */
	public static toggleBold: (editor: MirageMDEMethods) => void = toggleBold;
	public static toggleItalic: (editor: MirageMDEMethods) => void = toggleItalic;
	public static toggleStrikethrough: (editor: MirageMDEMethods) => void = toggleStrikethrough;
	public static toggleHeading1: (editor: MirageMDEMethods) => void = toggleHeading1;
	public static toggleHeading2: (editor: MirageMDEMethods) => void = toggleHeading2;
	public static toggleHeading3: (editor: MirageMDEMethods) => void = toggleHeading3;
	public static toggleHeading4: (editor: MirageMDEMethods) => void = toggleHeading4;
	public static toggleHeading5: (editor: MirageMDEMethods) => void = toggleHeading5;
	public static toggleHeading6: (editor: MirageMDEMethods) => void = toggleHeading6;
	public static toggleHeadingBigger: (editor: MirageMDEMethods) => void = toggleHeadingBigger;
	public static toggleHeadingSmaller: (editor: MirageMDEMethods) => void = toggleHeadingSmaller;
	public static toggleCodeBlock: (editor: MirageMDEMethods) => void = toggleCodeBlock;
	public static toggleBlockquote: (editor: MirageMDEMethods) => void = toggleBlockquote;
	public static toggleUnorderedList: (editor: MirageMDEMethods) => void = toggleUnorderedList;
	public static toggleOrderedList: (editor: MirageMDEMethods) => void = toggleOrderedList;
	public static cleanBlock: (editor: MirageMDEMethods) => void = cleanBlock;
	public static drawLink: (editor: MirageMDEMethods) => void = drawLink;
	public static drawImage: (editor: MirageMDEMethods) => void = drawImage;
	public static drawUploadedImage: (editor: MirageMDEMethods) => void = drawUploadedImage;
	public static drawTable: (editor: MirageMDEMethods) => void = drawTable;
	public static drawHorizontalRule: (editor: MirageMDEMethods) => void = drawHorizontalRule;
	public static togglePreview: (editor: MirageMDEMethods) => void = togglePreview;
	public static toggleSideBySide: (editor: MirageMDEMethods) => void = toggleSideBySide;
	public static toggleFullScreen: (editor: MirageMDEMethods) => void = toggleFullScreen;
	public static undo: (editor: MirageMDEMethods) => void = undo;
	public static redo: (editor: MirageMDEMethods) => void = redo;

}

class MirageMDEState extends MirageMDEStatic {

	public options: Options;
	public codemirror: CodeMirror.Editor;
	public toolbar: ToolbarItem[];
	public element: HTMLTextAreaElement;
	public _rendered: HTMLElement;
	public _autosave_timeout: number;
	public toolbar_div: HTMLDivElement;
	public toolbarElements: Record<string, HTMLElement>;
	public autosaveTimeoutId: number | undefined;
	public documentOnKeyDown: (ev: KeyboardEvent) => any;

	public gui: {
		sideBySide: HTMLElement;
		statusbar: HTMLElement;
		toolbar: HTMLElement;
	};

}

export class MirageMDEMethods extends MirageMDEState {

	public updateStatusBar = updateStatusBar.bind(this);
	public value = value.bind(this);
	public openBrowseFileWindow = openBrowseFileWindow.bind(this);
	public clearAutosavedValue = clearAutosavedValue.bind(this);
	public cleanup = cleanup.bind(this);
	public render = render.bind(this);
	public createToolbar = createToolbar.bind(this);
	public createStatusbar = createStatusbar.bind(this);
	public createSideBySide = createSideBySide.bind(this);
	public setPreviewMaxHeight = setPreviewMaxHeight.bind(this);
	public markdown = markdown.bind(this);
	public autosave = autosave.bind(this);
	public uploadImage = uploadImage.bind(this);
	public uploadImages = uploadImages.bind(this);
	public uploadImageUsingCustomFunction = uploadImageUsingCustomFunction.bind(this);
	public uploadImagesUsingCustomFunction = uploadImagesUsingCustomFunction.bind(this);

	public toggleBold = () => toggleBold(this);
	public toggleItalic = () => toggleItalic(this);
	public toggleStrikethrough = () => toggleStrikethrough(this);
	public toggleBlockquote = () => toggleBlockquote(this);
	public toggleHeadingSmaller = () => toggleHeadingSmaller(this);
	public toggleHeadingBigger = () => toggleHeadingBigger(this);
	public toggleHeading1 = () => toggleHeading1(this);
	public toggleHeading2 = () => toggleHeading2(this);
	public toggleHeading3 = () => toggleHeading3(this);
	public toggleHeading4 = () => toggleHeading4(this);
	public toggleHeading5 = () => toggleHeading5(this);
	public toggleHeading6 = () => toggleHeading6(this);
	public toggleCodeBlock = () => toggleCodeBlock(this);
	public toggleUnorderedList = () => toggleUnorderedList(this);
	public toggleOrderedList = () => toggleOrderedList(this);
	public cleanBlock = () => cleanBlock(this);
	public drawLink = () => drawLink(this);
	public drawImage = () => drawImage(this);
	public drawUploadedImage = () => drawUploadedImage(this);
	public drawTable = () => drawTable(this);
	public drawHorizontalRule = () => drawHorizontalRule(this);
	public undo = () => undo(this);
	public redo = () => redo(this);
	public togglePreview = () => togglePreview(this);
	public toggleSideBySide = () => toggleSideBySide(this);
	public toggleFullScreen = () => toggleFullScreen(this);
	public isPreviewActive = () => {
		const cm = this.codemirror;
		const wrapper = cm.getWrapperElement();
		const preview = wrapper.lastElementChild as HTMLElement;

		return preview.classList.contains('editor-preview-active');
	};

	public isSideBySideActive = () => {
		const cm = this.codemirror;
		const wrapper = cm.getWrapperElement();
		const preview = wrapper.lastElementChild as HTMLElement;

		return preview.classList.contains('editor-preview-active-side');
	};

	public isFullscreenActive = () => {
		return this.codemirror.getOption('fullScreen');
	};

	public getState = () => {
		return getState(this.codemirror);
	};

	public toTextArea = () => {
		const cm = this.codemirror;
		const wrapper = cm.getWrapperElement();
		const mdeContainer = wrapper.parentElement;

		if (mdeContainer) {
			if (this.gui.toolbar)
				mdeContainer.removeChild(this.gui.toolbar);

			if (this.gui.statusbar)
				mdeContainer.removeChild(this.gui.statusbar);

			if (this.gui.sideBySide)
				mdeContainer.removeChild(this.gui.sideBySide);
		}

		// Unwrap mdeContainer before codemirror toTextArea() call
		mdeContainer?.parentNode?.insertBefore(wrapper, mdeContainer);
		mdeContainer?.remove();

		(cm as any).toTextArea();

		if (this.autosaveTimeoutId) {
			clearTimeout(this.autosaveTimeoutId);
			this.autosaveTimeoutId = undefined;
			this.clearAutosavedValue();
		}
	};

}


export class MirageMDE extends MirageMDEMethods {

	constructor(options: Options = {} as any) {
		super();

		// Used later to refer to it"s parent
		options.parent = this;

		// Check if Font Awesome needs to be auto downloaded
		let autoDownloadFA = true;

		if (options.autoDownloadFontAwesome === false)
			autoDownloadFA = false;

		if (options.autoDownloadFontAwesome !== true) {
			const styleSheets = document.styleSheets;
			for (let i = 0; i < styleSheets.length; i++) {
				const stylesheet = styleSheets[i];
				if (!stylesheet?.href)
					continue;

				if (stylesheet.href.indexOf('//maxcdn.bootstrapcdn.com/font-awesome/') ?? 0 > -1)
					autoDownloadFA = false;
			}
		}

		if (autoDownloadFA) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css';
			document.getElementsByTagName('head')[0]?.appendChild(link);
		}

		// Find the textarea to use
		if (options.element) {
			this.element = options.element;
		}
		else if (options.element === null) {
			// This means that the element option was specified, but no element was found
			console.log('MirageMDE: Error. No element was found.');

			return;
		}

		// Handle toolbar
		if (options.toolbar === undefined) {
		// Initialize
			options.toolbar = [];

			// Loop over the built in buttons, to get the preferred order
			Object.entries(toolbarBuiltInButtons).forEach(([ key ]) => {
				if (!options.toolbar || options.toolbar === true)
					return;

				if (key.indexOf('separator-') != -1)
					options.toolbar.push('|');

				const button: any = toolbarBuiltInButtons[key];
				if (button.default === true ||
					(options.showIcons && Array.isArray(options.showIcons) &&
					options.showIcons.indexOf(key) != -1)
				)
					options.toolbar.push(key as any);
			});
		}

		// Editor preview styling class.
		options.previewClass ??= 'editor-preview';

		// Handle status bar
		if (options.status === undefined) {
			options.status = [ 'autosave', 'lines', 'words', 'cursor' ];

			if (options.uploadImage)
				options.status.unshift('upload-image');
		}

		// Add default preview rendering function
		if (!options.previewRender) {
			options.previewRender = (plainText, _previewEl: HTMLElement) => {
				return this.options.parent?.markdown(plainText) ?? '';
			};
		}

		// Set default options for parsing config
		options.parsingConfig = extend({
			highlightFormatting: true, // needed for toggleCodeBlock to detect types of code
		}, options.parsingConfig || {});

		// Merging the insertTexts, with the given options
		options.insertTexts = extend({}, insertTexts, options.insertTexts || {});


		// Merging the promptTexts, with the given options
		options.promptTexts = extend({}, promptTexts, options.promptTexts || {});


		// Merging the blockStyles, with the given options
		options.blockStyles = extend({}, blockStyles, options.blockStyles || {});

		if (options.autosave != undefined) {
			// Merging the Autosave timeFormat, with the given options
			options.autosave.timeFormat = extend({}, timeFormat, options.autosave.timeFormat || {});
		}

		options.iconClassMap = extend<typeof iconClassMap>({}, iconClassMap, options.iconClassMap || {} as any);

		// Merging the shortcuts, with the given options
		options.shortcuts = extend<Shortcuts>({}, shortcuts, options.shortcuts || {});

		options.maxHeight = options.maxHeight || undefined;

		options.direction = options.direction || 'ltr';

		if (typeof options.maxHeight !== 'undefined') {
			// Min and max height are equal if maxHeight is set
			options.minHeight = options.maxHeight;
		}
		else {
			options.minHeight = options.minHeight || '300px';
		}

		options.errorCallback = options.errorCallback || function(errorMessage) {
			alert(errorMessage);
		};

		// Import-image default configuration
		options.uploadImage = options.uploadImage || false;
		options.imageMaxSize = options.imageMaxSize || 2097152; // 1024 * 1024 * 2
		options.imageAccept = options.imageAccept || 'image/png, image/jpeg, image/gif, image/avif';
		options.imageTexts = extend({}, imageTexts, options.imageTexts || {});
		options.errorMessages = extend({}, errorMessages, options.errorMessages || {});
		options.imagePathAbsolute = options.imagePathAbsolute || false;
		options.imageCSRFName = options.imageCSRFName || 'csrfmiddlewaretoken';
		options.imageCSRFHeader = options.imageCSRFHeader || false;

		// Change unique_id to uniqueId for backwards compatibility
		if (options.autosave != undefined
			&& options.autosave.unique_id != undefined
			&& options.autosave.unique_id != ''
		)
			options.autosave.uniqueId = options.autosave.unique_id;

		// If overlay mode is specified and combine is not provided, default it to true
		if (options.overlayMode && options.overlayMode.combine === undefined)
			options.overlayMode.combine = true;

		// Update this options
		this.options = options;

		// Auto render
		this.render();

		// The codemirror component is only available after rendering
		// so, the setter for the initialValue can only run after
		// the element has been rendered
		if (options.initialValue && (!this.options.autosave || this.options.autosave.foundSavedValue !== true))
			this.value(options.initialValue);

		if (options.uploadImage) {
			this.codemirror.on('dragenter', (cm, event) => {
				this.updateStatusBar('upload-image', this.options.imageTexts!.sbOnDragEnter!);
				event.stopPropagation();
				event.preventDefault();
			});
			this.codemirror.on('dragend' as 'dragenter', (cm, event) => {
				this.updateStatusBar('upload-image', this.options.imageTexts!.sbInit!);
				event.stopPropagation();
				event.preventDefault();
			});
			this.codemirror.on('dragleave', (cm, event) => {
				this.updateStatusBar('upload-image', this.options.imageTexts!.sbInit!);
				event.stopPropagation();
				event.preventDefault();
			});

			this.codemirror.on('dragover', (cm, event) => {
				this.updateStatusBar('upload-image', this.options.imageTexts!.sbOnDragEnter!);
				event.stopPropagation();
				event.preventDefault();
			});

			this.codemirror.on('drop', (cm, event) => {
				event.stopPropagation();
				event.preventDefault();
				if (options.imageUploadFunction)
					this.uploadImagesUsingCustomFunction(options.imageUploadFunction, event!.dataTransfer!.files);
				else
					this.uploadImages(event.dataTransfer!.files!);
			});

			this.codemirror.on('paste' as any, (cm: CodeMirror.Editor, event: ClipboardEvent) => {
				if (options.imageUploadFunction)
					this.uploadImagesUsingCustomFunction(options.imageUploadFunction, event.clipboardData!.files);
				else
					this.uploadImages(event.clipboardData!.files);
			});
		}
	}


}
