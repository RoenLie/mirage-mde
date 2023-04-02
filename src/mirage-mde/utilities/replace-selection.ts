export const _replaceSelection = (
	cm: CodeMirror.Editor,
	active: boolean,
	startEnd: [string, string],
	url?: string,
) => {
	const lastElement = cm.getWrapperElement().lastElementChild as HTMLElement | null;
	if (lastElement?.classList.contains('editor-preview-active'))
		return;

	let text;
	let start = startEnd[0]!;
	let end = startEnd[1]!;
	const startPoint: any = {};
	const endPoint: any = {};
	Object.assign(startPoint, cm.getCursor('start'));
	Object.assign(endPoint, cm.getCursor('end'));

	if (url) {
		start = start.replace('#url#', url);  // url is in start for upload-image
		end = end.replace('#url#', url);
	}

	if (active) {
		text = cm.getLine(startPoint.line);
		start = text.slice(0, startPoint.ch);
		end = text.slice(startPoint.ch);
		cm.replaceRange(start + end, {
			line: startPoint.line,
			ch:   0,
		});
	}
	else {
		text = cm.getSelection();
		cm.replaceSelection(start + text + end);

		startPoint.ch += start.length;
		if (startPoint !== endPoint)
			endPoint.ch += start.length;
	}

	cm.setSelection(startPoint, endPoint);
	cm.focus();
};
