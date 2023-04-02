import { MirageMDE } from '../mirage-mde.js';


/**
 * Get or set the text content.
 */
export const value = (editor: MirageMDE, val?: string): MirageMDE | string => {
	const cm = editor.codemirror;

	if (val === undefined) {
		return cm.getValue();
	}
	else {
		cm.getDoc().setValue(val);

		return editor;
	}
};
