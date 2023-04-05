import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, insertTab } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { bracketMatching, defaultHighlightStyle, foldKeymap, indentOnInput, indentUnit, syntaxHighlighting } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { lintKeymap } from '@codemirror/lint';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { EditorState } from '@codemirror/state';
import { crosshairCursor, drawSelection, dropCursor, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, keymap, lineNumbers, rectangularSelection } from '@codemirror/view';
import { basicDark } from 'cm6-theme-basic-dark';
import { EditorView } from 'codemirror';

import { toggleCheckbox } from './commands/toggle-checkbox.js';
import { undoTab } from './commands/undo-tab.js';


export const CodeMirrorSetup = [
	lineNumbers(),
	highlightActiveLineGutter(),
	highlightSpecialChars(),
	history(),
	drawSelection(),
	dropCursor(),
	indentOnInput(),
	syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
	bracketMatching(),
	closeBrackets(),
	autocompletion(),
	rectangularSelection(),
	crosshairCursor(),
	highlightActiveLine(),
	highlightSelectionMatches(),
	markdown({
		base:          markdownLanguage,
		codeLanguages: languages,
		addKeymap:     true,
		extensions:    [],
	}),
	basicDark,
	indentUnit.of('   '),
	EditorState.tabSize.of(3),
	EditorView.lineWrapping,
	EditorState.allowMultipleSelections.of(true),
	EditorView.lineWrapping,
	keymap.of([
		...closeBracketsKeymap,
		...defaultKeymap,
		...searchKeymap,
		...historyKeymap,
		...foldKeymap,
		...completionKeymap,
		...lintKeymap,
		{ key: 'Tab', run: insertTab, shift: undoTab },
		{ key: 'c-d', run: toggleCheckbox },
	]),
];
