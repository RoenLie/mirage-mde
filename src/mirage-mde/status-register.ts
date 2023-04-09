import { type EditorView, type ViewUpdate } from '@codemirror/view';
import { type StringLiteral } from '@roenlie/mimic/types';

import { type MirageMDE } from './mirage-mde.js';
import { wordCount } from './utilities/word-count.js';


export interface StatusBarItem {
	value?: string;
	name: string;
	template: (item: StatusBarItem, editor: EditorView, scope: MirageMDE) => string;
	css?: (item: StatusBarItem, editor: EditorView, scope: MirageMDE) => string;
	initialize?: (item: StatusBarItem, update: ViewUpdate, scope: MirageMDE) => void;
	onUpdate?: (item: StatusBarItem, update: ViewUpdate, scope: MirageMDE) => void;
	onAnyUpdate?: (item: StatusBarItem, update: ViewUpdate, scope: MirageMDE) => void;
	onActivity?: (item: StatusBarItem, update: ViewUpdate, scope: MirageMDE) => void;
}


export type BuildInStatus = [
	'words',
	'lines',
	'cursor',
	'autosave',
	'upload-image',
][number];


export const defaultStatus: BuildInStatus[] = [
	'words',
	'lines',
	'cursor',
];


export const statusRegistry = new Map<StringLiteral, StatusBarItem>([
	[
		'words', {
			name:     'words',
			template: (item) => `
			<div>
				words: ${ item.value ?? '' }
			</div>
			`,
			css: () => `
			`,
			initialize: (item, update) => {
				item.value = String(wordCount(update.state.doc.toString()));
			},
			onUpdate: (item, update) => {
				item.value = String(wordCount(update.state.doc.toString()));
			},
		},
	],
	[
		'lines', {
			name:     'lines',
			template: (item) => `
			<div>
				lines: ${ item.value ?? '' }
			</div>
			`,
			css: () => `
			`,
			initialize: (item, update) => {
				item.value = String(update.state.doc.lines);
			},
			onUpdate: (item, update) => {
				item.value = String(update.state.doc.lines);
			},
			onActivity: () => {
			},
		},
	],
	[
		'cursor', {
			name:     'cursor',
			template: (item) => `
			<div>
				${ item.value ?? '' }
			</div>
			`,
			css:        () => ``,
			initialize: (item, update) => {
				const { state, state: { selection } } = update;
				const pos = selection.main.to;
				const posLine = state.doc.lineAt(pos);
				const posColumn = pos - posLine.from;

				item.value = `${ posLine.number }:${ posColumn }`;
			},
			onActivity: (item, update) => {
				const { state, state: { selection } } = update;
				const pos = selection.main.to;
				const posLine = state.doc.lineAt(pos);
				const posColumn = pos - posLine.from;

				item.value = `${ posLine.number }:${ posColumn }`;
			},
		},
	],
	[
		'autosave', {
			name:     'autosave',
			template: (item) => `
			<div>
				${ item.value ?? '' }
			</div>
			`,
			onAnyUpdate: (item, update, scope) => {
				if (!scope.saved)
					item.value = 'autosaved';
				else
					item.value = '';
			},
		},
	],
	[
		'upload-image', {
			name:     'upload-image',
			template: (item) => `
			<div>
				${ item.value ?? '' }
			</div>
			`,
			initialize: (item, update, scope) => {
				item.value = scope.options.imageTexts?.sbInit ?? '';
			},
		},
	],
]);
