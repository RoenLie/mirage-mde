import { cleanBlock } from './actions/clean-block.js';
import { drawHorizontalRule } from './actions/draw-horizontal-rule.js';
import { drawImage } from './actions/draw-image.js';
import { drawLink } from './actions/draw-link.js';
import { drawTable } from './actions/draw-table.js';
import { drawUploadedImage } from './actions/draw-uploaded-image.js';
import { redo, undo } from './actions/history.js';
import { toggleBlockquote } from './actions/toggle-blockquote.js';
import { toggleCodeBlock } from './actions/toggle-codeblock.js';
import { toggleFullScreen } from './actions/toggle-fullscreen.js';
import { toggleHeading1, toggleHeading2, toggleHeading3, toggleHeading4, toggleHeading6, toggleHeadingBigger, toggleHeadingSmaller } from './actions/toggle-heading.js';
import { toggleOrderedList, toggleUnorderedList } from './actions/toggle-list.js';
import { togglePreview } from './actions/toggle-preview.js';
import { toggleSideBySide } from './actions/toggle-sidebyside.js';
import { toggleBold, toggleItalic, toggleStrikethrough } from './codemirror/commands/toggle-text-marker.js';
import { ToolbarItem } from './mirage-mde-types.js';


export type StringLiteral = Record<never, never> & string;
export type BuiltInAction = [
	'separator',
	'bold',
	'italic',
	'strikethrough',
	'heading',
	'heading-bigger',
	'heading-smaller',
	'heading-1',
	'heading-2',
	'heading-3',
	'code',
	'quote',
	'ordered-list',
	'unordered-list',
	'clean-block',
	'link',
	'image',
	'upload-image',
	'table',
	'horizontal-rule',
	'preview',
	'side-by-side',
	'fullscreen',
	'guide',
	'undo',
	'redo',
	'separator-1',
	'separator-2',
	'separator-3',
	'separator-4',
	'separator-5',
	'separator-6',
][number]


export const defaultToolbar: BuiltInAction[] = [
	'bold',
	'italic',
	'strikethrough',
	'separator-1',
	'heading',
	'heading-bigger',
	'heading-smaller',
	'heading-1',
	'heading-2',
	'heading-3',
	'separator-2',
	'code',
	'ordered-list',
	'unordered-list',
	'clean-block',
	'separator-3',
	'link',
	'image',
	'upload-image',
	'table',
	'horizontal-rule',
	'separator-4',
	'preview',
	'side-by-side',
	'fullscreen',
	'separator-5',
	'undo',
	'redo',
	'separator-6',
	'guide',
];


export const actionRegister = new Map<StringLiteral | BuiltInAction, ToolbarItem>([
	[ 'separator',   { type: 'separator' } ],
	[ 'separator-1', { type: 'separator' } ],
	[ 'separator-2', { type: 'separator' } ],
	[ 'separator-3', { type: 'separator' } ],
	[ 'separator-4', { type: 'separator' } ],
	[ 'separator-5', { type: 'separator' } ],
	[ 'separator-6', { type: 'separator' } ],
	[
		'bold', {
			type:     'button',
			name:     'bold',
			action:   toggleBold,
			shortcut: 'c-b',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/type-bold.svg',
			title:    'Bold',
			marker:   [ 'bold' ],
		},
	],
	[
		'italic', {
			type:     'button',
			name:     'italic',
			action:   toggleItalic,
			shortcut: 'c-i',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/type-italic.svg',
			title:    'Italic',
			marker:   [ 'italic' ],
		},
	],
	[
		'strikethrough', {
			type:     'button',
			name:     'strikethrough',
			action:   toggleStrikethrough,
			shortcut: 'c-u',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/type-strikethrough.svg',
			title:    'Strikethrough',
			marker:   [ 'strikethrough' ],
		},
	],
	[
		'heading', {
			type:    'button',
			name:    'heading',
			action:  toggleHeadingSmaller as any,
			iconUrl: 'https://icons.getbootstrap.com/assets/icons/type.svg',
			title:   'Heading',
			marker:  [ 'H1', 'H2', 'H3', 'H4', 'H5', 'H6' ],
		},
	],
	[
		'heading-bigger', {
			type:     'button',
			name:     'heading-bigger',
			action:   toggleHeadingBigger as any,
			shortcut: 'Shift-Cmd-H',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/arrow-up-short.svg',
			title:    'Bigger Heading',
		},
	],
	[
		'heading-smaller', {
			type:     'button',
			name:     'heading-smaller',
			action:   toggleHeadingSmaller as any,
			shortcut: 'Cmd-H',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/arrow-down-short.svg',
			title:    'Smaller Heading',
		},
	],
	[
		'heading-1', {
			type:     'button',
			name:     'heading-1',
			action:   toggleHeading1 as any,
			shortcut: 'Ctrl+Alt+1',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/type-h1.svg',
			title:    'H1 heading',
			marker:   [ 'H1' ],
		},
	],
	[
		'heading-2', {
			type:     'button',
			name:     'heading-2',
			action:   toggleHeading2 as any,
			shortcut: 'Ctrl+Alt+2',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/type-h2.svg',
			title:    'H2 heading',
			marker:   [ 'H2' ],
		},
	],
	[
		'heading-3', {
			type:     'button',
			name:     'heading-3',
			action:   toggleHeading3 as any,
			shortcut: 'Ctrl+Alt+3',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/type-h3.svg',
			title:    'H3 heading',
			marker:   [ 'H3' ],
		},
	],
	[
		'heading-4', {
			type:     'button',
			name:     'heading-4',
			action:   toggleHeading4 as any,
			shortcut: 'Ctrl+Alt+4',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/type-h1.svg',
			title:    'H4 heading',
			marker:   [ 'H4' ],
		},
	],
	[
		'heading-5', {
			type:     'button',
			name:     'heading-5',
			action:   toggleHeading6 as any,
			shortcut: 'Ctrl+Alt+5',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/type-h2.svg',
			title:    'H5 heading',
			marker:   [ 'H5' ],
		},
	],
	[
		'heading-6', {
			type:     'button',
			name:     'heading-6',
			action:   toggleHeading6 as any,
			shortcut: 'Ctrl+Alt+6',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/type-h3.svg',
			title:    'H6 heading',
			marker:   [ 'H6' ],
		},
	],
	[
		'code', {
			type:     'button',
			name:     'code',
			action:   toggleCodeBlock as any,
			shortcut: 'Cmd-Alt-C',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/code.svg',
			title:    'Code',
		},
	],
	[
		'quote', {
			type:     'button',
			name:     'quote',
			action:   toggleBlockquote as any,
			shortcut: 'Cmd-\'',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/quote.svg',
			title:    'Quote',
		},
	],
	[
		'ordered-list', {
			type:     'button',
			name:     'ordered-list',
			action:   toggleOrderedList as any,
			shortcut: 'Cmd-Alt-L',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/list-ol.svg',
			title:    'Numbered List',
			marker:   [ 'ordered-list' ],
		},
	],
	[
		'unordered-list', {
			type:     'button',
			name:     'unordered-list',
			action:   toggleUnorderedList as any,
			shortcut: 'Cmd-L',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/list-ul.svg',
			title:    'Generic List',
			marker:   [ 'unordered-list' ],
		},
	],
	[
		'clean-block', {
			type:     'button',
			name:     'clean-block',
			action:   cleanBlock as any,
			shortcut: 'Cmd-E',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/eraser.svg',
			title:    'Clean block',
		},
	],
	[
		'link', {
			type:     'button',
			name:     'link',
			action:   drawLink as any,
			shortcut: 'Cmd-K',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/link.svg',
			title:    'Create Link',
		},
	],
	[
		'image', {
			type:     'button',
			name:     'image',
			action:   drawImage as any,
			shortcut: 'Cmd-Alt-I',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/image.svg',
			title:    'Insert Image',
		},
	],
	[
		'upload-image', {
			type:    'button',
			name:    'upload-image',
			action:  drawUploadedImage as any,
			iconUrl: 'https://icons.getbootstrap.com/assets/icons/cloud-arrow-up.svg',
			title:   'Import an image',
		},
	],
	[
		'table', {
			type:    'button',
			name:    'table',
			action:  drawTable as any,
			iconUrl: 'https://icons.getbootstrap.com/assets/icons/table.svg',
			title:   'Insert Table',
		},
	],
	[
		'horizontal-rule', {
			type:    'button',
			name:    'horizontal-rule',
			action:  drawHorizontalRule as any,
			iconUrl: 'https://icons.getbootstrap.com/assets/icons/dash-lg.svg',
			title:   'Insert Horizontal Line',
		},
	],
	[
		'preview', {
			type:      'button',
			name:      'preview',
			action:    togglePreview,
			shortcut:  'Cmd-P',
			iconUrl:   'https://icons.getbootstrap.com/assets/icons/eye.svg',
			noDisable: true,
			title:     'Toggle Preview',
		},
	],
	[
		'side-by-side', {
			type:     'button',
			name:     'side-by-side',
			action:   toggleSideBySide,
			shortcut: 'F9',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/layout-sidebar-inset-reverse.svg',
			title:    'Toggle Side by Side',
			noMobile: true,
		},
	],
	[
		'fullscreen', {
			type:      'button',
			name:      'fullscreen',
			action:    toggleFullScreen,
			shortcut:  'F11',
			iconUrl:   'https://icons.getbootstrap.com/assets/icons/fullscreen.svg',
			title:     'Toggle Fullscreen',
			noDisable: true,
			noMobile:  true,
		},
	],
	[
		'undo', {
			type:    'button',
			name:    'undo',
			action:  undo as any,
			iconUrl: 'https://icons.getbootstrap.com/assets/icons/arrow-counterclockwise.svg',
			title:   'Undo',
		},
	],
	[
		'redo', {
			type:    'button',
			name:    'redo',
			action:  redo as any,
			iconUrl: 'https://icons.getbootstrap.com/assets/icons/arrow-clockwise.svg',
			title:   'Redo',
		},
	],
	[
		'guide', {
			type:      'button',
			name:      'guide',
			action:    'https://www.markdownguide.org/basic-syntax/',
			iconUrl:   'https://icons.getbootstrap.com/assets/icons/question-circle.svg',
			title:     'Markdown Guide',
			noDisable: true,
		},
	],
]);
