import CodeMirror from 'codemirror';


CodeMirror.commands.tabAndIndentMarkdownList = function(cm: CodeMirror.Editor) {
	let ranges = cm.listSelections();
	let pos = ranges[0].head;
	let eolState = cm.getStateAfter(pos.line);
	let inList = eolState.list !== false;

	if (inList) {
		cm.execCommand('indentMore');

		return;
	}

	if (cm.options.indentWithTabs) {
		cm.execCommand('insertTab');
	}
	else {
		let spaces = Array(cm.options.tabSize + 1).join(' ');
		cm.replaceSelection(spaces);
	}
};

CodeMirror.commands.shiftTabAndUnindentMarkdownList = function(cm: CodeMirror.Editor) {
	let ranges = cm.listSelections();
	let pos = ranges[0].head;
	let eolState = cm.getStateAfter(pos.line);
	let inList = eolState.list !== false;

	if (inList) {
		cm.execCommand('indentLess');

		return;
	}

	if (cm.options.indentWithTabs) {
		cm.execCommand('insertTab');
	}
	else {
		let spaces = Array(cm.options.tabSize + 1).join(' ');
		cm.replaceSelection(spaces);
	}
};
