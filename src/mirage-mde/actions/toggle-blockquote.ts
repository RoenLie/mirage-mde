import { MirageMDE } from '../mirage-mde.js';
import { _toggleLine } from './toggle-line.js';


/**
 * Action for toggling blockquote.
 */
export const toggleBlockquote = (editor: MirageMDE) => {
	_toggleLine(editor.codemirror, 'quote', '');
};
