import { cleanBlock } from './actions/clean-block.js';
import { drawHorizontalRule } from './actions/draw-horizontal-rule.js';
import { drawImage } from './actions/draw-image.js';
import { drawLink } from './actions/draw-link.js';
import { drawTable } from './actions/draw-table.js';
import { drawUploadedImage } from './actions/draw-uploaded-image.js';
import { redo, undo } from './actions/history.js';
import { toggleBlockquote } from './actions/toggle-blockquote.js';
import { toggleBold } from './actions/toggle-bold.js';
import { toggleCodeBlock } from './actions/toggle-codeblock.js';
import { toggleFullScreen } from './actions/toggle-fullscreen.js';
import { toggleHeading1, toggleHeading2, toggleHeading3, toggleHeading4, toggleHeading6, toggleHeadingBigger, toggleHeadingSmaller } from './actions/toggle-heading.js';
import { toggleItalic } from './actions/toggle-italic.js';
import { toggleOrderedList, toggleUnorderedList } from './actions/toggle-list.js';
import { togglePreview } from './actions/toggle-preview.js';
import { toggleSideBySide } from './actions/toggle-sidebyside.js';
import { toggleStrikethrough } from './actions/toggle-strikethrough.js';
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


export const actionRegister = new Map<StringLiteral | BuiltInAction, ToolbarItem>();
actionRegister.set('separator',   { type: 'separator' });
actionRegister.set('separator-1', { type: 'separator' });
actionRegister.set('separator-2', { type: 'separator' });
actionRegister.set('separator-3', { type: 'separator' });
actionRegister.set('separator-4', { type: 'separator' });
actionRegister.set('separator-5', { type: 'separator' });
actionRegister.set('separator-6', { type: 'separator' });
actionRegister.set('bold', {
	type:     'button',
	name:     'bold',
	action:   toggleBold,
	shortcut: 'Cmd-B',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/type-bold.svg',
	title:    'Bold',
});
actionRegister.set('italic', {
	type:     'button',
	name:     'italic',
	action:   toggleItalic,
	shortcut: 'Cmd-I',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/type-italic.svg',
	title:    'Italic',
});
actionRegister.set('strikethrough', {
	type:    'button',
	name:    'strikethrough',
	action:  toggleStrikethrough,
	iconUrl: 'https://icons.getbootstrap.com/assets/icons/type-strikethrough.svg',
	title:   'Strikethrough',
});
actionRegister.set('heading', {
	type:    'button',
	name:    'heading',
	action:  toggleHeadingSmaller,
	iconUrl: 'https://icons.getbootstrap.com/assets/icons/type.svg',
	title:   'Heading',
});
actionRegister.set('heading-bigger', {
	type:     'button',
	name:     'heading-bigger',
	action:   toggleHeadingBigger,
	shortcut: 'Shift-Cmd-H',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/arrow-up-short.svg',
	title:    'Bigger Heading',
});
actionRegister.set('heading-smaller', {
	type:     'button',
	name:     'heading-smaller',
	action:   toggleHeadingSmaller,
	shortcut: 'Cmd-H',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/arrow-down-short.svg',
	title:    'Smaller Heading',
});
actionRegister.set('heading-1', {
	type:     'button',
	name:     'heading-1',
	action:   toggleHeading1,
	shortcut: 'Ctrl+Alt+1',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/type-h1.svg',
	title:    'H1 heading',
});
actionRegister.set('heading-2', {
	type:     'button',
	name:     'heading-2',
	action:   toggleHeading2,
	shortcut: 'Ctrl+Alt+2',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/type-h2.svg',
	title:    'H2 heading',
});
actionRegister.set('heading-3', {
	type:     'button',
	name:     'heading-3',
	action:   toggleHeading3,
	shortcut: 'Ctrl+Alt+3',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/type-h3.svg',
	title:    'H3 heading',
});
actionRegister.set('heading-4', {
	type:     'button',
	name:     'heading-4',
	action:   toggleHeading4,
	shortcut: 'Ctrl+Alt+4',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/type-h1.svg',
	title:    'H4 heading',
});
actionRegister.set('heading-5', {
	type:     'button',
	name:     'heading-5',
	action:   toggleHeading6,
	shortcut: 'Ctrl+Alt+5',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/type-h2.svg',
	title:    'H5 heading',
});
actionRegister.set('heading-6', {
	type:     'button',
	name:     'heading-6',
	action:   toggleHeading6,
	shortcut: 'Ctrl+Alt+6',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/type-h3.svg',
	title:    'H6 heading',
});
actionRegister.set('code', {
	type:     'button',
	name:     'code',
	action:   toggleCodeBlock,
	shortcut: 'Cmd-Alt-C',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/code.svg',
	title:    'Code',
});
actionRegister.set('quote', {
	type:     'button',
	name:     'quote',
	action:   toggleBlockquote,
	shortcut: 'Cmd-\'',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/quote.svg',
	title:    'Quote',
});
actionRegister.set('ordered-list', {
	type:     'button',
	name:     'ordered-list',
	action:   toggleOrderedList,
	shortcut: 'Cmd-Alt-L',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/list-ol.svg',
	title:    'Numbered List',
});
actionRegister.set('unordered-list', {
	type:     'button',
	name:     'unordered-list',
	action:   toggleUnorderedList,
	shortcut: 'Cmd-L',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/list-ul.svg',
	title:    'Generic List',
});
actionRegister.set('clean-block', {
	type:     'button',
	name:     'clean-block',
	action:   cleanBlock,
	shortcut: 'Cmd-E',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/eraser.svg',
	title:    'Clean block',
});
actionRegister.set('link', {
	type:     'button',
	name:     'link',
	action:   drawLink,
	shortcut: 'Cmd-K',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/link.svg',
	title:    'Create Link',
});
actionRegister.set('image', {
	type:     'button',
	name:     'image',
	action:   drawImage,
	shortcut: 'Cmd-Alt-I',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/image.svg',
	title:    'Insert Image',
});
actionRegister.set('upload-image', {
	type:    'button',
	name:    'upload-image',
	action:  drawUploadedImage,
	iconUrl: 'https://icons.getbootstrap.com/assets/icons/cloud-arrow-up.svg',
	title:   'Import an image',
});
actionRegister.set('table', {
	type:    'button',
	name:    'table',
	action:  drawTable,
	iconUrl: 'https://icons.getbootstrap.com/assets/icons/table.svg',
	title:   'Insert Table',
});
actionRegister.set('horizontal-rule', {
	type:    'button',
	name:    'horizontal-rule',
	action:  drawHorizontalRule,
	iconUrl: 'https://icons.getbootstrap.com/assets/icons/dash-lg.svg',
	title:   'Insert Horizontal Line',
});
actionRegister.set('preview', {
	type:      'button',
	name:      'preview',
	action:    togglePreview,
	shortcut:  'Cmd-P',
	iconUrl:   'https://icons.getbootstrap.com/assets/icons/eye.svg',
	noDisable: true,
	title:     'Toggle Preview',
});
actionRegister.set('side-by-side', {
	type:     'button',
	name:     'side-by-side',
	action:   toggleSideBySide,
	shortcut: 'F9',
	iconUrl:  'https://icons.getbootstrap.com/assets/icons/layout-sidebar-inset-reverse.svg',
	title:    'Toggle Side by Side',
	noMobile: true,
});
actionRegister.set('fullscreen', {
	type:      'button',
	name:      'fullscreen',
	action:    toggleFullScreen,
	shortcut:  'F11',
	iconUrl:   'https://icons.getbootstrap.com/assets/icons/fullscreen.svg',
	title:     'Toggle Fullscreen',
	noDisable: true,
	noMobile:  true,
});
actionRegister.set('undo', {
	type:    'button',
	name:    'undo',
	action:  undo,
	iconUrl: 'https://icons.getbootstrap.com/assets/icons/arrow-counterclockwise.svg',
	title:   'Undo',
});
actionRegister.set('redo', {
	type:    'button',
	name:    'redo',
	action:  redo,
	iconUrl: 'https://icons.getbootstrap.com/assets/icons/arrow-clockwise.svg',
	title:   'Redo',
});
actionRegister.set('guide', {
	type:      'button',
	name:      'guide',
	action:    'https://www.markdownguide.org/basic-syntax/',
	iconUrl:   'https://icons.getbootstrap.com/assets/icons/question-circle.svg',
	title:     'Markdown Guide',
	noDisable: true,
});
