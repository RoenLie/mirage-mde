import { MirageMDE } from '../mirage-mde.js';
import { getState } from '../utilities/get-state.js';
import { _replaceSelection } from '../utilities/replace-selection.js';


export const _toggleLink = (
	editor: MirageMDE,
	type: 'link' | 'image',
	startEnd: [string, string],
	url: string,
) => {
	if (!editor.codemirror || editor.isPreviewActive())
		return;

	const cm = editor.codemirror;
	const stat = getState(cm);
	const active = stat[type]!;
	if (!active) {
		_replaceSelection(cm, active, startEnd, url);

		return;
	}

	const startPoint = cm.getCursor('start');
	const endPoint = cm.getCursor('end');
	const text = cm.getLine(startPoint.line);
	let start = text.slice(0, startPoint.ch);
	let end = text.slice(startPoint.ch);

	if (type == 'link')
		start = start.replace(/(.*)[^!]\[/, '$1');
	else if (type == 'image')
		start = start.replace(/(.*)!\[$/, '$1');

	end = end.replace(/]\(.*?\)/, '');

	cm.replaceRange(start + end, {
		line: startPoint.line,
		ch:   0,
	}, {
		line: startPoint.line,
		ch:   99999999999999,
	});

	startPoint.ch -= startEnd[0].length;
	if (startPoint !== endPoint)
		endPoint.ch -= startEnd[0].length;

	cm.setSelection(startPoint, endPoint);
	cm.focus();
};
