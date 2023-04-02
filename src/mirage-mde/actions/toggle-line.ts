import { getState } from '../utilities/get-state.js';


export const _toggleLine = (
	cm: CodeMirror.Editor,
	name: string,
	liststyle: string,
) => {
	const lastElement = cm.getWrapperElement().lastElementChild as HTMLElement | null;
	if (lastElement?.classList.contains('editor-preview-active'))
		return;

	const quoteRegexp = /^(\s*)>\s+/;
	const listRegexp = /^(\s*)(\*|-|\+|\d*\.)(\s+)/;
	const whitespacesRegexp = /^\s*/;

	const stat = getState(cm);
	const startPoint = cm.getCursor('start');
	const endPoint = cm.getCursor('end');
	const repl: Record<string, RegExp> = {
		'quote':          quoteRegexp,
		'unordered-list': listRegexp,
		'ordered-list':   listRegexp,
	};

	const _getChar = (name: string, i: string) => {
		const map: Record<string, string> = {
			'quote':          '>',
			'unordered-list': liststyle,
			'ordered-list':   '%%i.',
		};

		return map[name]?.replace('%%i', i);
	};

	const _checkChar = (name: string, char: string) => {
		const map: Record<string, string> = {
			'quote':          '>',
			'unordered-list': '\\' + liststyle,
			'ordered-list':   '\\d+.',
		};
		const rt = new RegExp(map[name] ?? '');

		return char && rt.test(char);
	};

	const _toggle = (name: string, text: string, untoggleOnly: boolean) => {
		const arr = listRegexp.exec(text);
		let char = _getChar(name, String(line));
		if (arr !== null) {
			if (_checkChar(name, arr[2]!))
				char = '';

			text = arr[1]! + char + arr[3] + text.replace(whitespacesRegexp, '').replace(repl[name]!, '$1');
		}
		else if (untoggleOnly == false) {
			text = char + ' ' + text;
		}

		return text;
	};

	let line = 1;
	for (let i = startPoint.line; i <= endPoint.line; i++) {
		let text = cm.getLine(i);

		if (stat[name]) {
			text = text.replace(repl[name]!, '$1');
		}
		else {
			// If we're toggling unordered-list formatting, check if the current line
			// is part of an ordered-list, and if so, untoggle that first.
			// Workaround for https://github.com/Ionaru/easy-markdown-editor/issues/92
			if (name == 'unordered-list')
				text = _toggle('ordered-list', text, true);

			text = _toggle(name, text, false);
			line += 1;
		}

		cm.replaceRange(text, {
			line: i,
			ch:   0,
		}, {
			line: i,
			ch:   99999999999999,
		});
	}

	cm.focus();
};
