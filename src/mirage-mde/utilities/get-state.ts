/**
 * The state of CodeMirror at the given position.
 */
export const getState = (cm: CodeMirror.Editor, pos?: CodeMirror.Position) => {
	pos = pos || cm.getCursor('start');
	const stat = cm.getTokenAt(pos);
	if (!stat.type)
		return {};

	const types = stat.type.split(' ');

	const ret: Partial<{
		[key: string]: boolean;
		bold: boolean;
		'ordered-list': boolean;
		'unordered-list': boolean;
		quote: boolean;
		italic: boolean;
		strikethrough: boolean;
		code: boolean;
		image: boolean;
		link: boolean;
		table: boolean;
	}> = {};

	let data;
	let text;

	for (let i = 0; i < types.length; i++) {
		data = types[i];

		if (data === 'strong') {
			ret.bold = true;
		}
		else if (data === 'variable-2') {
			text = cm.getLine(pos.line);
			if (/^\s*\d+\.\s/.test(text))
				ret['ordered-list'] = true;
			else
				ret['unordered-list'] = true;
		}
		else if (data === 'atom') {
			ret.quote = true;
		}
		else if (data === 'em') {
			ret.italic = true;
		}
		else if (data === 'quote') {
			ret.quote = true;
		}
		else if (data === 'strikethrough') {
			ret.strikethrough = true;
		}
		else if (data === 'comment') {
			ret.code = true;
		}
		else if (data === 'link' && !ret.image) {
			ret.link = true;
		}
		else if (data === 'image') {
			ret.image = true;
		}
		else if (data?.match(/^header(-[1-6])?$/)) {
			ret[data.replace('header', 'heading')] = true;
		}
	}

	return ret;
};
