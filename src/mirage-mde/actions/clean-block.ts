import { MirageMDE } from '../mirage-mde.js';


/**
 * Action for clean block (remove headline, list, blockquote code, markers)
 */
export const cleanBlock = (editor: MirageMDE) => {
	_cleanBlock(editor.codemirror);
};


const _cleanBlock = (cm: CodeMirror.Editor) => {
	const lastElement = cm.getWrapperElement().lastElementChild as HTMLElement | null;
	if (lastElement?.classList.contains('editor-preview-active'))
		return;

	const startPoint = cm.getCursor('start');
	const endPoint = cm.getCursor('end');
	let text;

	for (let line = startPoint.line; line <= endPoint.line; line++) {
		text = cm.getLine(line);
		text = text.replace(/^[ ]*([# ]+|\*|-|[> ]+|[0-9]+(.|\)))[ ]*/, '');

		cm.replaceRange(text, {
			line: line,
			ch:   0,
		}, {
			line: line,
			ch:   99999999999999,
		});
	}
};
