import { MirageMDE } from '../mirage-mde.js';
import { getState } from '../utilities/get-state.js';


export const _toggleBlock = (
	editor: MirageMDE,
	type: string,
	start_chars: string,
	end_chars?: string,
) => {
	if (!editor.codemirror || editor.isPreviewActive)
		return;

	end_chars = (typeof end_chars === 'undefined') ? start_chars : end_chars;
	const cm = editor.codemirror;
	const stat = getState(cm);

	let text;
	let start = start_chars;
	let end = end_chars;

	const startPoint = cm.getCursor('start');
	const endPoint = cm.getCursor('end');

	if (stat[type]) {
		text = cm.getLine(startPoint.line);
		start = text.slice(0, startPoint.ch);
		end = text.slice(startPoint.ch);
		if (type == 'bold') {
			start = start.replace(/(\*\*|__)(?![\s\S]*(\*\*|__))/, '');
			end = end.replace(/(\*\*|__)/, '');
		}
		else if (type == 'italic') {
			start = start.replace(/(\*|_)(?![\s\S]*(\*|_))/, '');
			end = end.replace(/(\*|_)/, '');
		}
		else if (type == 'strikethrough') {
			start = start.replace(/(\*\*|~~)(?![\s\S]*(\*\*|~~))/, '');
			end = end.replace(/(\*\*|~~)/, '');
		}

		cm.replaceRange(start + end, {
			line: startPoint.line,
			ch:   0,
		}, {
			line: startPoint.line,
			ch:   99999999999999,
		});

		if (type == 'bold' || type == 'strikethrough') {
			startPoint.ch -= 2;
			if (startPoint !== endPoint)
				endPoint.ch -= 2;
		}
		else if (type == 'italic') {
			startPoint.ch -= 1;
			if (startPoint !== endPoint)
				endPoint.ch -= 1;
		}
	}
	else {
		text = cm.getSelection();
		if (type == 'bold') {
			text = text.split('**').join('');
			text = text.split('__').join('');
		}
		else if (type == 'italic') {
			text = text.split('*').join('');
			text = text.split('_').join('');
		}
		else if (type == 'strikethrough') {
			text = text.split('~~').join('');
		}

		cm.replaceSelection(start + text + end);

		startPoint.ch += start_chars.length;
		endPoint.ch = startPoint.ch + text.length;
	}

	cm.setSelection(startPoint, endPoint);
	cm.focus();
};
