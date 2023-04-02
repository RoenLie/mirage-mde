import { MirageMDE } from '../mirage-mde.js';


/**
 * Undo action.
 */
export const undo = (editor: MirageMDE) => {
	const cm = editor.codemirror;
	cm.undo();
	cm.focus();
};


/**
 * Redo action.
 */
export const redo = (editor: MirageMDE) => {
	const cm = editor.codemirror;
	cm.redo();
	cm.focus();
};
