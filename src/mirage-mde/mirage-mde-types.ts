import { Extension } from '@codemirror/state';
import { EditorView } from 'codemirror';
import { LitElement } from 'lit';
import { marked } from 'marked';

import { BuiltInAction, StringLiteral } from './action-register.js';
import { Marker } from './codemirror/listeners/get-state.js';
import { MirageMDE } from './mirage-mde.js';


export type MMDECommand = (target: EditorView, scope: MirageMDE) => boolean


export type RecordOf<T, K extends keyof any, V> = T & Record<K, V>;

export type ToolbarItem = ToolbarSeparator | ToolbarButton | ToolbarDropdown;

export interface ToolbarButtonBase {
	name: StringLiteral | BuiltInAction;
	iconUrl?: string;
	title?: string;
	shortcut?: string;
	noDisable?: boolean;
	noMobile?: boolean;
}

export interface ToolbarDropdown extends ToolbarButtonBase {
	type: 'dropdown';
	children: (StringLiteral | BuiltInAction)[];
}

export interface ToolbarButton extends ToolbarButtonBase {
	type: 'button';
	action?: string | MMDECommand;
	text?: string;
	marker?: Marker[];
}

export interface ToolbarSeparator {
	type: 'separator';
}

export interface TimeFormatOptions {
	locale?: string | string[];
	format?: Intl.DateTimeFormatOptions;
}

export interface AutoSaveOptions {
	enabled: boolean;
	uniqueId: string;
	delay?: number;
	submit_delay?: number;
	text?: string;
	timeFormat?: TimeFormatOptions;
	foundSavedValue?: boolean;
	bound?: boolean;
	loaded?: boolean;
}

export interface BlockStyleOptions {
	bold?: string;
	code?: string;
	italic?: string;
}

export interface InsertTextOptions {
	horizontalRule?: [string, string];
	image?: [string, string];
	link?: [string, string];
	table?: [string, string];
	uploadedImage?: [string, string];
}

export interface ParsingOptions {
	name?: string;
	allowAtxHeaderWithoutSpace?: boolean;
	strikethrough?: boolean;
	underscoresBreakWords?: boolean;
	gitHubSpice?: boolean;
	highlightFormatting?: boolean;
}

export interface PromptTexts {
	image?: string;
	link?: string;
}

export interface RenderingOptions {
	codeSyntaxHighlighting?: boolean;
	hljs?: any;
	markedOptions?: marked.MarkedOptions;
	sanitizerFunction?: (html: string) => string;
	singleLineBreaks?: boolean;
}

export interface StatusBarItem {
	className: string;
	value: string;
	onUpdate: () => string;
	onActivity: () => string;
}

export interface ImageTextsOptions {
	sbInit?: string;
	sbOnDragEnter?: string;
	sbOnDrop?: string;
	sbProgress?: string;
	sbOnUploaded?: string;
	sizeUnits?: string;
}

export interface ImageErrorTextsOptions {
	noFileGiven?: string;
	typeNotAllowed?: string;
	fileTooLarge?: string;
	importError?: string;
	filesTooLarge?: string;
}

export interface Options {
	extensions?: Extension[],
	host: LitElement;
	autofocus?: boolean;
	autosave?: AutoSaveOptions;
	autoRefresh?: boolean | { delay: number; };
	blockStyles?: BlockStyleOptions;
	hideIcons?: (StringLiteral | BuiltInAction)[];
	indentWithTabs?: boolean;
	initialValue?: string;
	insertTexts?: InsertTextOptions;
	lineNumbers?: boolean;
	lineWrapping?: boolean;
	parsingConfig?: ParsingOptions;
	placeholder?: string;
	previewImagesInEditor?: boolean;
	imagesPreviewHandler?: (src: string) => string;
	previewRender?: (markdownPlaintext: string) => string;
	promptURLs?: boolean;
	renderingConfig?: RenderingOptions;
	inputStyle?: 'textarea' | 'contenteditable';
	nativeSpellcheck?: boolean;
	status?: (string | StatusBarItem)[];
	styleSelectedText?: boolean;
	tabSize?: number;
	toolbar?: (StringLiteral | BuiltInAction)[];
	toolbarActions?: (ToolbarButton | ToolbarDropdown)[];
	toolbarTooltips?: boolean;
	theme?: string;
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
	errorMessages?: RecordOf<ImageErrorTextsOptions, string, string>;
	errorCallback?: (errorMessage: string) => void;
	promptTexts?: PromptTexts;
	direction?: 'ltr' | 'rtl';
}
