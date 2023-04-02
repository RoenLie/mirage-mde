import { MirageMDE } from '../mirage-mde.js';
import { _toggleLine } from './toggle-line.js';


/**
 * Action for toggling ul.
 */
export const toggleUnorderedList = (editor: MirageMDE) => {
	const cm = editor.codemirror;

	let listStyle = '*'; // Default
	if ([ '-', '+', '*' ].includes(editor.options?.unorderedListStyle ?? ''))
		listStyle = editor.options.unorderedListStyle!;

	_toggleLine(cm, 'unordered-list', listStyle);
};


/**
 * Action for toggling ol.
 */
export const toggleOrderedList = (editor: MirageMDE) => {
	_toggleLine(editor.codemirror, 'ordered-list', '');
};
