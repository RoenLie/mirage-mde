import CodeMirror, { ScrollbarModels } from 'codemirror';
import { marked } from 'marked';

import { EasyMDE2 } from './EasyMDE2.js';
import { IconClassMap } from './main.js';


interface ArrayOneOrMore<T> extends Array<T> {
	0: T;
}


type RecordOf<T = object> = T & Record<keyof any, any>;


export type ToolbarBuiltInButton =
	'bold'
	| 'italic'
	| 'strikethrough'
	| 'heading'
	| 'heading-smaller'
	| 'heading-bigger'
	| 'heading-1'
	| 'heading-2'
	| 'heading-3'
	| 'separator-1'
	| 'separator-2'
	| 'separator-3'
	| 'separator-4'
	| 'separator-5'
	| 'code'
	| 'quote'
	| 'unordered-list'
	| 'ordered-list'
	| 'clean-block'
	| 'link'
	| 'image'
	| 'upload-image'
	| 'table'
	| 'horizontal-rule'
	| 'preview'
	| 'side-by-side'
	| 'fullscreen'
	| 'guide'
	| 'undo'
	| 'redo'

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
    | 'guide';

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
	horizontalRule?: ReadonlyArray<string>;
	image?: ReadonlyArray<string>;
	link?: ReadonlyArray<string>;
	table?: ReadonlyArray<string>;
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

export interface Shortcuts {
	[action: string]: string | undefined | null;
	toggleBlockquote?: string | null;
	toggleBold?: string | null;
	cleanBlock?: string | null;
	toggleHeadingSmaller?: string | null;
	toggleItalic?: string | null;
	drawLink?: string | null;
	toggleUnorderedList?: string | null;
	togglePreview?: string | null;
	toggleCodeBlock?: string | null;
	drawImage?: string | null;
	toggleOrderedList?: string | null;
	toggleHeadingBigger?: string | null;
	toggleSideBySide?: string | null;
	toggleFullScreen?: string | null;
}

interface StatusBarItem {
	className: string;
	defaultValue: (element: HTMLElement) => void;
	onUpdate: (element: HTMLElement) => void;
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
	action: string | ((editor: EasyMDE2) => void);
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
	codeMirrorInstance: CodeMirror.Editor;
}

export interface Options {
	parent: EasyMDE2;
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
	scrollbarStyle?: keyof ScrollbarModels;
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
	iconClassMap: IconClassMap;
}
