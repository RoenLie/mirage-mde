import { syntaxTree } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { isRangeInRanges, Range } from '@roenlie/mimic/validation';

import { Tree } from '../types/tree.js';


export type Marker = TextMarker | LineMarker | [
	'link',
	'image',
][number];


export type TextMarker = [
	'bold',
	'italic',
	'strikethrough'
][number];


export type LineMarker = [
	'H1',
	'H2',
	'H3',
	'H4',
	'H5',
	'H6',
	'blockquote',
	'ordered-list',
	'unordered-list',
][number];


const markerMap: Record<string, Marker> = {
	StrongEmphasis: 'bold',
	Emphasis:       'italic',
	Strikethrough:  'strikethrough',
	OrderedList:    'ordered-list',
	BulletList:     'unordered-list',
	ATXHeading1:    'H1',
	ATXHeading2:    'H2',
	ATXHeading3:    'H3',
	ATXHeading4:    'H4',
	ATXHeading5:    'H5',
	ATXHeading6:    'H6',
	Link:           'link',
	Image:          'image',
	Blockquote:     'blockquote',
};


export const textMarkerValue: Record<TextMarker, string> = {
	bold:          '**',
	italic:        '*',
	strikethrough: '~~',
};


export const lineMarkerValue: Record<LineMarker, string> = {
	'ordered-list':   '* ',
	'unordered-list': '1. ',
	'blockquote':     '> ',
	'H1':             '# ',
	'H2':             '## ',
	'H3':             '### ',
	'H4':             '#### ',
	'H5':             '##### ',
	'H6':             '###### ',
};


export const getNodesInRange = (state: EditorState, range: Range) => {
	const activeSymbols: ({
		marker: Marker,
		from: number;
		to: number;
		name: string;
	})[] = [];

	(syntaxTree(state) as Tree).iterate({
		enter: ({ node }) => {
			if (!isRangeInRanges([ { from: node.from, to: node.to } ], range))
				return;

			console.log(node.name);

			const name = markerMap[node.name];
			if (!name)
				return;

			activeSymbols.push({
				marker: name,
				name:   node.name,
				from:   node.from,
				to:     node.to,
			});
		},
	});

	return activeSymbols;
};
