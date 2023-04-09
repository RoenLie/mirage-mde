import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, insertTab } from '@codemirror/commands';
import { markdown, markdownLanguage  } from '@codemirror/lang-markdown';
import { bracketMatching, defaultHighlightStyle, foldKeymap, HighlightStyle, indentOnInput, indentUnit, syntaxHighlighting } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { lintKeymap } from '@codemirror/lint';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { EditorState } from '@codemirror/state';
import {
	crosshairCursor,
	drawSelection, dropCursor,
	highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars,
	keymap, lineNumbers, rectangularSelection,
} from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { basicDark } from 'cm6-theme-basic-dark';
import { EditorView } from 'codemirror';

import { toggleCheckbox } from './commands/toggle-checkbox.js';
import { undoTab } from './commands/undo-tab.js';


export const codeMirrorSetup = [
	lineNumbers(),
	highlightActiveLineGutter(),
	highlightSpecialChars(),
	history(),
	drawSelection(),
	dropCursor(),
	indentOnInput(),
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
	syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
	syntaxHighlighting(HighlightStyle.define([
		{ tag: tags.heading1, class: 'cm-header-1' },
		{ tag: tags.heading2, class: 'cm-header-2' },
		{ tag: tags.heading3, class: 'cm-header-3' },
		{ tag: tags.heading4, class: 'cm-header-4' },
		{ tag: tags.heading5, class: 'cm-header-5' },
		{ tag: tags.heading6, class: 'cm-header-6' },
	])),
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
