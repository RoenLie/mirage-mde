import { EditorView } from '@codemirror/view';
import { deepMerge } from '@roenlie/mimic/structs';
import { StringLiteral } from '@roenlie/mimic/types';
import hljs from 'highlight.js';
import { LitElement } from 'lit';
import { type Ref } from 'lit/directives/ref.js';

import { actionRegister, BuiltInAction, defaultToolbar, ToolbarItem } from './action-register.js';
import { updateStatusBar } from './actions/update-status-bar.js';
import {
	uploadImage,
	uploadImages,
	uploadImagesUsingCustomFunction,
	uploadImageUsingCustomFunction,
} from './actions/upload-images.js';
import { Marker } from './codemirror/listeners/get-state.js';
import { EditorElement } from './components/mirage-mde-editor.js';
import { PreviewElement } from './components/mirage-mde-preview.js';
import { StatusbarElement } from './components/mirage-mde-statusbar.js';
import { ToolbarElement } from './components/mirage-mde-toolbar.js';
import {
	blockStyles,
	errorMessages,
	imageTexts,
	insertTexts,
	promptTexts,
	timeFormat,
} from './constants.js';
import {
	BlockStyleOptions,
	ImageErrorTextsOptions,
	ImageTextsOptions,
	InsertTextOptions,
	Options,
	ParsingOptions,
	PromptTexts,
	TimeFormatOptions,
} from './mirage-mde-types.js';
import { BuildInStatus, defaultStatus, StatusBarItem, statusRegistry } from './status-register.js';
import { autosave } from './utilities/autosave.js';
import { markdown } from './utilities/markdown.js';
import { openBrowseFileWindow } from './utilities/open-file-window.js';
import { value } from './utilities/value.js';


type GUIElements = {
	editor: EditorElement;
	preview: PreviewElement;
	toolbar: ToolbarElement;
	statusbar: StatusbarElement;
}
type GUIClasses = Record<keyof GUIElements, Partial<Record<'hidden', boolean>>>;


export class MirageMDE {

	public options: Options;
	public host: LitElement;
	public editor: EditorView;
	public hljs = hljs;
	public element: HTMLTextAreaElement;
	public toolbar: (StringLiteral | BuiltInAction)[];
	public toolbarElements: Record<string, Ref<HTMLElement>> = {};
	public statusbar: (StringLiteral | BuildInStatus)[];
	public saved = false;
	public lastSaved = '';
	public autosaveTimeoutId: number | undefined;
	public activeMarkers: Marker[] = [];
	public gui: GUIElements = {} as any;
	public guiClasses: GUIClasses = {
		preview:   { hidden: true },
		editor:    {},
		toolbar:   {},
		statusbar: {},
	};

	public get isSideBySideActive() {
		return this.host.classList.contains('sidebyside');
	}

	constructor(options: Options = {} as any) {
		this.options = options;

		// Assign the host.
		this.host = options.host!;

		// Handle toolbar
		this.toolbar = [ ...options.toolbar ?? defaultToolbar ];

		// Register any additional toolbar actions.
		options.toolbarActions?.forEach(action => {
			let existing = (actionRegister.get(action.name) ?? {}) as ToolbarItem;
			if (action.type === existing.type)
				actionRegister.set(action.name, deepMerge<ToolbarItem>([ existing, action ]));
			else
				actionRegister.set(action.name, action);
		});

		// Handle status bar
		this.statusbar ??= [ ...options.statusbar ?? defaultStatus ];
		options.statusbarStatuses?.forEach(status => {
			let existing = (statusRegistry.get(status.name) ?? {}) as StatusBarItem;
			if (existing)
				statusRegistry.set(status.name, deepMerge([ existing, status ]));
			else
				statusRegistry.set(status.name, status);
		});

		if (options.uploadImage)
			this.statusbar.unshift('upload-image');

		options.renderingConfig = deepMerge([
			{
				singleLineBreaks:       true,
				codeSyntaxHighlighting: true,
				//hljs:                   hljs,
			},
			//options.renderingConfig ?? {},
		]);

		// linewrapping defaults to true.
		options.lineWrapping ??= true;

		// Default to showing line numbers.
		options.lineNumbers ??= true;

		// Default tab size of 3 spaces.
		options.tabSize ??= 3;

		// Add default preview rendering function
		options.previewRender ??= (plainText) => markdown(this, plainText);

		// Set default options for parsing config
		options.parsingConfig = deepMerge<ParsingOptions>([
			{
				highlightFormatting: true, // needed for toggleCodeBlock to detect types of code
			}, options.parsingConfig || {},
		]);

		// Merging the insertTexts, with the given options
		options.insertTexts = deepMerge<InsertTextOptions>([ insertTexts as any, options.insertTexts || {} ]);

		// Merging the promptTexts, with the given options
		options.promptTexts = deepMerge<PromptTexts>([ promptTexts, options.promptTexts || {} ]);

		// Merging the blockStyles, with the given options
		options.blockStyles = deepMerge<BlockStyleOptions>([ blockStyles, options.blockStyles || {} ]);

		if (options.autosave) {
			// Merging the Autosave timeFormat, with the given options
			options.autosave.timeFormat = deepMerge<TimeFormatOptions>(
				[ timeFormat as any, options.autosave.timeFormat || {} ],
			);
		}

		options.direction = options.direction ?? 'ltr';

		options.errorCallback = options.errorCallback ?? function(errorMessage) {
			alert(errorMessage);
		};

		// Import-image default configuration
		options.uploadImage       = options.uploadImage ?? false;
		options.imageMaxSize      = options.imageMaxSize ?? 2097152; // 1024 * 1024 * 2
		options.imageAccept       = options.imageAccept ?? 'image/png, image/jpeg, image/gif, image/avif';
		options.imageTexts        = deepMerge<ImageTextsOptions>([ imageTexts, options.imageTexts || {} ]);
		options.errorMessages     = deepMerge<ImageErrorTextsOptions>([ errorMessages, options.errorMessages || {} ]);
		options.imagePathAbsolute = options.imagePathAbsolute ?? false;
		options.imageCSRFName     = options.imageCSRFName ?? 'csrfmiddlewaretoken';
		options.imageCSRFHeader   = options.imageCSRFHeader ?? false;
	}


	public value(val: string | undefined): MirageMDE
	public value(val?: undefined): string
	public value(val: any): any { return value(this, val); }
	public updateStatusBar = updateStatusBar.bind(this);
	public openBrowseFileWindow = openBrowseFileWindow.bind(this);
	public autosave = autosave.bind(this);
	public uploadImage = uploadImage.bind(this);
	public uploadImages = uploadImages.bind(this);
	public uploadImageUsingCustomFunction = uploadImageUsingCustomFunction.bind(this);
	public uploadImagesUsingCustomFunction = uploadImagesUsingCustomFunction.bind(this);

	public isPreviewActive() {
		return this.host?.classList.contains('preview');
	}

	public isFullscreenActive() {
		return this.host.classList.contains('fullscreen');
	}

}
