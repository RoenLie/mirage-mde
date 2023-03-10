import CodeMirror from 'codemirror';


const commands = CodeMirror.commands as CodeMirror.CommandActions & Record<string, any>;

commands['tabAndIndentMarkdownList'] = function(cm: CodeMirror.Editor) {
	let ranges = cm.listSelections();
	let pos = ranges[0]!.head;
	let eolState = cm.getStateAfter(pos.line);
	let inList = eolState.list !== false;

	if (inList) {
		cm.execCommand('indentMore');

		return;
	}

	if ((cm as any).options.indentWithTabs) {
		cm.execCommand('insertTab');
	}
	else {
		let spaces = Array((cm as any).options.tabSize + 1).join(' ');
		cm.replaceSelection(spaces);
	}
};

commands['shiftTabAndUnindentMarkdownList'] = function(cm: CodeMirror.Editor) {
	let ranges = cm.listSelections();
	let pos = ranges[0]!.head;
	let eolState = cm.getStateAfter(pos.line);
	let inList = eolState.list !== false;

	if (inList) {
		cm.execCommand('indentLess');

		return;
	}

	if ((cm as any).options.indentWithTabs) {
		cm.execCommand('insertTab');
	}
	else {
		let spaces = Array((cm as any).options.tabSize + 1).join(' ');
		cm.replaceSelection(spaces);
	}
};
