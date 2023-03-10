import { marked } from 'marked';

import { CodeMirror } from './codemirror/Codemirror.js';
import { MirageMDE } from './mirage-mde.js';
import { IconClassMap, Shortcuts } from './mirage-mde-utilities.js';


interface ArrayOneOrMore<T> extends Array<T> {
	0: T;
}


type RecordOf<T = object> = T & Record<keyof any, any>;


export type ToolbarButton =
    'bold'
    | 'italic'
    | 'quote'
    | 'unordered-list'
    | 'ordered-list'
    | 'link'
    | 'image'
    | 'upload-image'
    | 'strikethrough'
    | 'code'
    | 'table'
    | 'redo'
    | 'heading'
    | 'undo'
    | 'heading-bigger'
    | 'heading-smaller'
    | 'heading-1'
    | 'heading-2'
    | 'heading-3'
    | 'clean-block'
    | 'horizontal-rule'
    | 'preview'
    | 'side-by-side'
    | 'fullscreen'
    | 'guide'
    | 'separator-1'
    | 'separator-2'
    | 'separator-3'
    | 'separator-4'
    | 'separator-5';

export type ToolbarItem = '|' | ToolbarItemIncomplete | ToolbarButton | ToolbarIcon | ToolbarDropdownIcon;


interface TimeFormatOptions {
	locale?: string | string[];
	format?: Intl.DateTimeFormatOptions;
}

interface AutoSaveOptions {
	enabled?: boolean;
	delay?: number;
	submit_delay?: number;
	uniqueId: string;
	unique_id?: string;
	timeFormat?: TimeFormatOptions;
	text?: string;
	foundSavedValue?: boolean;
	binded?: boolean;
	loaded?: boolean;
}

interface BlockStyleOptions {
	bold?: string;
	code?: string;
	italic?: string;
}

interface CustomAttributes {
	[key: string]: string;
}

interface InsertTextOptions {
	horizontalRule?: [string, string];
	image?: [string, string];
	link?: [string, string];
	table?: [string, string];
	uploadedImage?: [string, string];
}

interface ParsingOptions {
	name?: string;
	allowAtxHeaderWithoutSpace?: boolean;
	strikethrough?: boolean;
	underscoresBreakWords?: boolean;
	gitHubSpice?: boolean;
}

interface PromptTexts {
	image?: string;
	link?: string;
}

interface RenderingOptions {
	codeSyntaxHighlighting?: boolean;
	hljs?: any;
	markedOptions?: marked.MarkedOptions;
	sanitizerFunction?: (html: string) => string;
	singleLineBreaks?: boolean;
}


export interface StatusBarItem {
	className: string;
	defaultValue: (element: HTMLElement) => void;
	onUpdate: (element: HTMLElement) => void;
	onActivity: (element: HTMLElement) => void;
}

export interface ToolbarDropdownIcon {
	name: ToolbarButton;
	children: ArrayOneOrMore<ToolbarIcon | ToolbarButton>;
	className: string;
	title: string;
	noDisable?: boolean;
	noMobile?: boolean;
}

export interface ToolbarIcon {
	name: ToolbarButton;
	action: string | ((editor: MirageMDE) => void);
	className: string;
	title: string;
	noDisable?: boolean;
	noMobile?: boolean;
	icon?: string;
	attributes?: CustomAttributes;
}

export interface ToolbarItemIncomplete {
	name: ToolbarButton;
	default?: boolean | undefined;
}

interface ImageTextsOptions {
	sbInit?: string;
	sbOnDragEnter?: string;
	sbOnDrop?: string;
	sbProgress?: string;
	sbOnUploaded?: string;
	sizeUnits?: string;
}

interface ImageErrorTextsOptions {
	noFileGiven?: string;
	typeNotAllowed?: string;
	fileTooLarge?: string;
	importError?: string;
	filesTooLarge?: string;
}

interface OverlayModeOptions {
	mode: CodeMirror.Mode<any>;
	combine?: boolean;
}

interface SpellCheckerOptions {
	codeMirrorInstance: typeof CodeMirror;
}

export interface Options {
	parent?: MirageMDE;
	autoDownloadFontAwesome?: boolean;
	autofocus?: boolean;
	autosave?: AutoSaveOptions;
	autoRefresh?: boolean | { delay: number; };
	blockStyles?: BlockStyleOptions;
	element?: HTMLTextAreaElement;
	forceSync?: boolean;
	toolbarGuideIcon?: boolean;
	hideIcons?: ReadonlyArray<ToolbarButton>;
	indentWithTabs?: boolean;
	initialValue?: string;
	insertTexts?: InsertTextOptions;
	lineNumbers?: boolean;
	lineWrapping?: boolean;
	minHeight?: string;
	maxHeight?: string;
	parsingConfig?: ParsingOptions;
	placeholder?: string;
	previewClass?: string | ReadonlyArray<string>;
	previewImagesInEditor?: boolean;
	imagesPreviewHandler?: (src: string) => string,
	previewRender?: (markdownPlaintext: string, previewElement: HTMLElement) => string | null;
	promptURLs?: boolean;
	renderingConfig?: RenderingOptions;
	shortcuts?: Shortcuts;
	showIcons?: ReadonlyArray<ToolbarButton>;
	spellChecker?: boolean | ((options: SpellCheckerOptions) => void);
	inputStyle?: 'textarea' | 'contenteditable';
	nativeSpellcheck?: boolean;
	sideBySideFullscreen?: boolean;
	status?: boolean | Array<string | StatusBarItem>;
	styleSelectedText?: boolean;
	tabSize?: number;
	toolbar?: boolean | Array<ToolbarItem>;
	toolbarTips?: boolean;
	toolbarButtonClassPrefix?: string;
	onToggleFullScreen?: (goingIntoFullScreen: boolean) => void;
	theme?: string;
	scrollbarStyle?: keyof CodeMirror.ScrollbarModels;
	unorderedListStyle?: '*' | '-' | '+';
	uploadImage?: boolean;
	imageMaxSize?: number;
	imageAccept?: string;
	imageUploadFunction?: (file: File, onSuccess: (url: string) => void, onError: (error: string) => void) => void;
	imageUploadEndpoint?: string;
	imagePathAbsolute?: boolean;
	imageCSRFToken?: string;
	imageCSRFName?: string;
	imageCSRFHeader?: boolean;
	imageTexts?: ImageTextsOptions;
	errorMessages?: RecordOf<ImageErrorTextsOptions>;
	errorCallback?: (errorMessage: string) => void;
	promptTexts?: PromptTexts;
	syncSideBySidePreviewScroll?: boolean;
	overlayMode?: OverlayModeOptions;
	direction?: 'ltr' | 'rtl';
	iconClassMap?: IconClassMap;
}
