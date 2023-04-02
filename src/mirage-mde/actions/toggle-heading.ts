import { MirageMDE } from '../mirage-mde.js';

/**
 * Action for toggling heading size: normal -> h1 -> h2 -> h3 -> h4 -> h5 -> h6 -> normal
 */
export const toggleHeadingSmaller = (editor: MirageMDE) => {
	_toggleHeading(editor.codemirror, 'smaller');
};


/**
 * Action for toggling heading size: normal -> h6 -> h5 -> h4 -> h3 -> h2 -> h1 -> normal
 */
export const toggleHeadingBigger = (editor: MirageMDE) => {
	_toggleHeading(editor.codemirror, 'bigger');
};


/**
 * Action for toggling heading size 1
 */
export const toggleHeading1 = (editor: MirageMDE) => {
	_toggleHeading(editor.codemirror, undefined, 1);
};


/**
 * Action for toggling heading size 2
 */
export const toggleHeading2 = (editor: MirageMDE) => {
	_toggleHeading(editor.codemirror, undefined, 2);
};


/**
 * Action for toggling heading size 3
 */
export const toggleHeading3 = (editor: MirageMDE) => {
	_toggleHeading(editor.codemirror, undefined, 3);
};


/**
 * Action for toggling heading size 4
 */
export const toggleHeading4 = (editor: MirageMDE) => {
	_toggleHeading(editor.codemirror, undefined, 4);
};


/**
 * Action for toggling heading size 5
 */
export const toggleHeading5 = (editor: MirageMDE) => {
	_toggleHeading(editor.codemirror, undefined, 5);
};


/**
 * Action for toggling heading size 6
 */
export const toggleHeading6 = (editor: MirageMDE) => {
	_toggleHeading(editor.codemirror, undefined, 6);
};


const _toggleHeading = (cm: CodeMirror.Editor, direction: string | undefined, size = 1) => {
	const lastElement = cm.getWrapperElement().lastElementChild as HTMLElement | null;
	if (lastElement?.classList.contains('editor-preview-active'))
		return;

	const startPoint = cm.getCursor('start');
	const endPoint = cm.getCursor('end');
	for (let i = startPoint.line; i <= endPoint.line; i++) {
		(function(i) {
			let text = cm.getLine(i);
			const currHeadingLevel = text.search(/[^#]/);

			if (direction !== undefined) {
				if (currHeadingLevel <= 0) {
					if (direction == 'bigger')
						text = '###### ' + text;
					else
						text = '# ' + text;
				}
				else if (currHeadingLevel == 6 && direction == 'smaller') {
					text = text.substr(7);
				}
				else if (currHeadingLevel == 1 && direction == 'bigger') {
					text = text.substr(2);
				}
				else {
					if (direction == 'bigger')
						text = text.substr(1);
					else
						text = '#' + text;
				}
			}
			else {
				if (currHeadingLevel <= 0)
					text = '#'.repeat(size) + ' ' + text;
				else if (currHeadingLevel == size)
					text = text.substring(currHeadingLevel + 1);
				else
					text = '#'.repeat(size) + ' ' + text.substr(currHeadingLevel + 1);
			}

			cm.replaceRange(text, {
				line: i,
				ch:   0,
			}, {
				line: i,
				ch:   99999999999999,
			});
		})(i);
	}
	cm.focus();
};
