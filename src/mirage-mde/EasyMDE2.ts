import { Editor } from 'codemirror';

import { autosave } from './EasyMDE2-methods.js';
import { blockStyles, cleanBlock, drawHorizontalRule, drawImage, drawLink, drawTable, drawUploadedImage, errorMessages, extend, iconClassMap, imageTexts, insertTexts, promptTexts, redo, shortcuts, timeFormat, toggleBlockquote, toggleBold, toggleCodeBlock, toggleFullScreen, toggleHeading1, toggleHeading2, toggleHeading3, toggleHeading4, toggleHeading5, toggleHeading6, toggleHeadingBigger, toggleHeadingSmaller, toggleItalic, toggleOrderedList, togglePreview, toggleSideBySide, toggleStrikethrough, toggleUnorderedList, ToolbarBuiltInButtons, toolbarBuiltInButtons, undo } from './main.js';
import { EasyMDEBase, Options } from './types.js';


class EasyMDE2Static {

	public static toggleBold: (editor: EasyMDEBase) => void = toggleBold;
	public static toggleItalic: (editor: EasyMDEBase) => void = toggleItalic;
	public static toggleStrikethrough: (editor: EasyMDEBase) => void = toggleStrikethrough;
	public static toggleHeadingSmaller: (editor: EasyMDEBase) => void = toggleHeadingSmaller;
	public static toggleHeadingBigger: (editor: EasyMDEBase) => void = toggleHeadingBigger;
	public static toggleHeading1: (editor: EasyMDEBase) => void = toggleHeading1;
	public static toggleHeading2: (editor: EasyMDEBase) => void = toggleHeading2;
	public static toggleHeading3: (editor: EasyMDEBase) => void = toggleHeading3;
	public static toggleHeading4: (editor: EasyMDEBase) => void = toggleHeading4;
	public static toggleHeading5: (editor: EasyMDEBase) => void = toggleHeading5;
	public static toggleHeading6: (editor: EasyMDEBase) => void = toggleHeading6;
	public static toggleCodeBlock: (editor: EasyMDEBase) => void = toggleCodeBlock;
	public static toggleBlockquote: (editor: EasyMDEBase) => void = toggleBlockquote;
	public static toggleUnorderedList: (editor: EasyMDEBase) => void = toggleUnorderedList;
	public static toggleOrderedList: (editor: EasyMDEBase) => void = toggleOrderedList;
	public static cleanBlock: (editor: EasyMDEBase) => void = cleanBlock;
	public static drawLink: (editor: EasyMDEBase) => void = drawLink;
	public static drawImage: (editor: EasyMDEBase) => void = drawImage;
	public static drawUploadedImage: (editor: EasyMDEBase) => void = drawUploadedImage;
	public static drawTable: (editor: EasyMDEBase) => void = drawTable;
	public static drawHorizontalRule: (editor: EasyMDEBase) => void = drawHorizontalRule;
	public static togglePreview: (editor: EasyMDEBase) => void = togglePreview;
	public static toggleSideBySide: (editor: EasyMDEBase) => void = toggleSideBySide;
	public static toggleFullScreen: (editor: EasyMDEBase) => void = toggleFullScreen;
	public static undo: (editor: EasyMDEBase) => void = undo;
	public static redo: (editor: EasyMDEBase) => void = redo;

}


export class EasyMDE2 extends EasyMDE2Static {

	constructor(public options: Options = {} as any) {
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
			console.log('EasyMDE: Error. No element was found.');

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

				if (toolbarBuiltInButtons[key].default === true ||
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
			options.previewRender = function(plainText, previewEl: HTMLElement) {
				// Note: "this" refers to the options object
				return this.parent.markdown(plainText);
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

		options.iconClassMap = extend({}, iconClassMap, options.iconClassMap || {});

		// Merging the shortcuts, with the given options
		options.shortcuts = extend({}, shortcuts, options.shortcuts || {});

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

			this.codemirror.on('paste' as any, (cm: Editor, event: ClipboardEvent) => {
				if (options.imageUploadFunction)
					this.uploadImagesUsingCustomFunction(options.imageUploadFunction, event.clipboardData!.files);
				else
					this.uploadImages(event.clipboardData!.files);
			});
		}
	}

	public element: HTMLElement;
	public autosaveTimeoutId: number | undefined;
	public value(): string;
	public value(val: string): void;
	public value(val?: unknown): string | void {
		throw new Error('Method not implemented.');
	}

	public codemirror: Editor;

	public autosave = autosave.bind(this);

	public render(): void {
		throw new Error('Method not implemented.');
	}

	public markdown(text: string): string | null {
		throw new Error('Method not implemented.');
	}

	public cleanup(): void {
		throw new Error('Method not implemented.');
	}

	public toTextArea(): void {
		throw new Error('Method not implemented.');
	}

	public isPreviewActive(): boolean {
		throw new Error('Method not implemented.');
	}

	public isSideBySideActive(): boolean {
		throw new Error('Method not implemented.');
	}

	public isFullscreenActive(): boolean {
		throw new Error('Method not implemented.');
	}

	public clearAutosavedValue(): void {
		throw new Error('Method not implemented.');
	}

	public updateStatusBar(itemName: string, content: string): void {
		throw new Error('Method not implemented.');
	}

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
	public uploadImagesUsingCustomFunction(imageUploadFunction: Function, files: FileList) {
		throw new Error('Method not implemented.');
	}

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
	public uploadImages(files: FileList, onSuccess?: Function, onError?: Function) {
		throw new Error('Method not implemented.');
	}

}
