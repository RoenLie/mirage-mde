import { MirageMDE } from '../mirage-mde.js';
import { _replaceSelection } from '../utilities/replace-selection.js';


/**
 * Action for toggling code block.
 */
export const toggleCodeBlock = (editor: MirageMDE) => {
	const fenceCharsToInsert = editor.options?.blockStyles?.code;

	const fencing_line = (line: any) => {
		/* return true, if this is a ``` or ~~~ line */
		if (typeof line !== 'object') {
			throw 'fencing_line() takes a \'line\' ' +
				'object (not a line number, or line text).  Got: ' +
				typeof line + ': ' + line;
		}

		return line.styles && line.styles[2] && line.styles[2].indexOf('formatting-code-block') !== -1;
	};

	const token_state = (token: any) => {
		// base goes an extra level deep when mode backdrops are used, e.g. spellchecker on
		return token.state.base.base || token.state.base;
	};

	const code_type = (
		cm: CodeMirror.Editor,
		line_num: number,
		line?: any,
		firstTok?: any,
		lastTok?: any,
	) => {
		/*
		 * Return "single", "indented", "fenced" or false
		 *
		 * cm and line_num are required.  Others are optional for efficiency
		 * To check in the middle of a line, pass in firstTok yourself.
		 */
		line ??= cm.getLineHandle(line_num);
		firstTok ??= cm.getTokenAt({
			line: line_num,
			ch:   1,
		});
		lastTok ??= (!!line.text && cm.getTokenAt({
			line: line_num,
			ch:   line.text.length - 1,
		}));

		const types = firstTok.type ? firstTok.type.split(' ') : [];

		if (lastTok && token_state(lastTok).indentedCode) {
			// have to check last char, since first chars of first line aren"t marked as indented
			return 'indented';
		}
		else if (types.indexOf('comment') === -1) {
			// has to be after "indented" check, since first chars of first indented line aren"t marked as such
			return false;
		}
		else if (token_state(firstTok).fencedChars || token_state(lastTok).fencedChars || fencing_line(line)) {
			return 'fenced';
		}
		else {
			return 'single';
		}
	};

	const insertFencingAtSelection = (
		cm: CodeMirror.Editor,
		cur_start: any,
		cur_end: any,
		fenceCharsToInsert: any,
	) => {
		let start_line_sel = cur_start.line + 1;
		let end_line_sel = cur_end.line + 1;
		let sel_multi = cur_start.line !== cur_end.line;
		let repl_start = fenceCharsToInsert + '\n';
		let repl_end = '\n' + fenceCharsToInsert;
		if (sel_multi)
			end_line_sel++;

		// handle last char including \n or not
		if (sel_multi && cur_end.ch === 0) {
			repl_end = fenceCharsToInsert + '\n';
			end_line_sel--;
		}

		_replaceSelection(cm, false, [ repl_start, repl_end ]);
		cm.setSelection({
			line: start_line_sel,
			ch:   0,
		}, {
			line: end_line_sel,
			ch:   0,
		});
	};

	const cm = editor.codemirror;
	const cur_start = cm.getCursor('start');
	const cur_end = cm.getCursor('end');
	const tok = cm.getTokenAt({
		line: cur_start.line,
		ch:   cur_start.ch || 1,
	}); // avoid ch 0 which is a cursor pos but not token
	let line = cm.getLineHandle(cur_start.line);
	const is_code = code_type(cm, cur_start.line, line, tok);

	let block_start: number | undefined;
	let block_end: number | undefined;
	let lineCount: number;

	if (is_code === 'single') {
		// similar to some MirageMDE _toggleBlock logic
		const start = line.text.slice(0, cur_start.ch).replace('`', ''),
			end = line.text.slice(cur_start.ch).replace('`', '');
		cm.replaceRange(start + end, {
			line: cur_start.line,
			ch:   0,
		}, {
			line: cur_start.line,
			ch:   99999999999999,
		});
		cur_start.ch--;
		if (cur_start !== cur_end)
			cur_end.ch--;

		cm.setSelection(cur_start, cur_end);
		cm.focus();
	}
	else if (is_code === 'fenced') {
		if (cur_start.line !== cur_end.line || cur_start.ch !== cur_end.ch) {
			// use selection

			// find the fenced line so we know what type it is (tilde, backticks, number of them)
			for (block_start = cur_start.line; block_start >= 0; block_start--) {
				line = cm.getLineHandle(block_start);
				if (fencing_line(line))
					break;
			}

			const fencedTok = cm.getTokenAt({
				line: block_start,
				ch:   1,
			});

			const fence_chars = token_state(fencedTok).fencedChars;
			let start_text: string;
			let start_line: number;
			let end_text: string;
			let end_line: number;

			// check for selection going up against fenced lines, in which case we don't want to add more fencing
			if (fencing_line(cm.getLineHandle(cur_start.line))) {
				start_text = '';
				start_line = cur_start.line;
			}
			else if (fencing_line(cm.getLineHandle(cur_start.line - 1))) {
				start_text = '';
				start_line = cur_start.line - 1;
			}
			else {
				start_text = fence_chars + '\n';
				start_line = cur_start.line;
			}

			if (fencing_line(cm.getLineHandle(cur_end.line))) {
				end_text = '';
				end_line = cur_end.line;
				if (cur_end.ch === 0)
					end_line += 1;
			}
			else if (cur_end.ch !== 0 && fencing_line(cm.getLineHandle(cur_end.line + 1))) {
				end_text = '';
				end_line = cur_end.line + 1;
			}
			else {
				end_text = fence_chars + '\n';
				end_line = cur_end.line + 1;
			}

			if (cur_end.ch === 0) {
				// full last line selected, putting cursor at beginning of next
				end_line -= 1;
			}

			cm.operation(() => {
				// end line first, so that line numbers don't change
				cm.replaceRange(end_text, {
					line: end_line,
					ch:   0,
				}, {
					line: end_line + (end_text ? 0 : 1),
					ch:   0,
				});

				cm.replaceRange(start_text, {
					line: start_line,
					ch:   0,
				}, {
					line: start_line + (start_text ? 0 : 1),
					ch:   0,
				});
			});

			cm.setSelection({
				line: start_line + (start_text ? 1 : 0),
				ch:   0,
			}, {
				line: end_line + (start_text ? 1 : -1),
				ch:   0,
			});

			cm.focus();
		}
		else {
			// no selection, search for ends of this fenced block
			let search_from = cur_start.line;
			if (fencing_line(cm.getLineHandle(cur_start.line))) { // gets a little tricky if cursor is right on a fenced line
				if (code_type(cm, cur_start.line + 1) === 'fenced') {
					block_start = cur_start.line;
					search_from = cur_start.line + 1; // for searching for "end"
				}
				else {
					block_end = cur_start.line;
					search_from = cur_start.line - 1; // for searching for "start"
				}
			}
			if (block_start === undefined) {
				for (block_start = search_from; block_start >= 0; block_start--) {
					line = cm.getLineHandle(block_start);
					if (fencing_line(line))
						break;
				}
			}
			if (block_end === undefined) {
				lineCount = cm.lineCount();
				for (block_end = search_from; block_end < lineCount; block_end++) {
					line = cm.getLineHandle(block_end);
					if (fencing_line(line))
						break;
				}
			}

			cm.operation(() => {
				cm.replaceRange('', {
					line: block_start!,
					ch:   0,
				}, {
					line: block_start! + 1,
					ch:   0,
				});
				cm.replaceRange('', {
					line: block_end! - 1,
					ch:   0,
				}, {
					line: block_end!,
					ch:   0,
				});
			});
			cm.focus();
		}
	}
	else if (is_code === 'indented') {
		if (cur_start.line !== cur_end.line || cur_start.ch !== cur_end.ch) {
			// use selection
			block_start = cur_start.line;
			block_end = cur_end.line;
			if (cur_end.ch === 0)
				block_end--;
		}
		else {
			// no selection, search for ends of this indented block
			for (block_start = cur_start.line; block_start >= 0; block_start--) {
				line = cm.getLineHandle(block_start);
				if (line.text.match(/^\s*$/)) {
					// empty or all whitespace - keep going
					continue;
				}
				else {
					if (code_type(cm, block_start, line) !== 'indented') {
						block_start += 1;
						break;
					}
				}
			}
			lineCount = cm.lineCount();
			for (block_end = cur_start.line; block_end < lineCount; block_end++) {
				line = cm.getLineHandle(block_end);
				if (line.text.match(/^\s*$/)) {
					// empty or all whitespace - keep going
					continue;
				}
				else {
					if (code_type(cm, block_end, line) !== 'indented') {
						block_end -= 1;
						break;
					}
				}
			}
		}

		// if we are going to un-indent based on a selected set of lines, and the next line is indented too, we need to
		// insert a blank line so that the next line(s) continue to be indented code
		const next_line = cm.getLineHandle(block_end + 1);
		const next_line_last_tok = next_line && cm.getTokenAt({
			line: block_end + 1,
			ch:   next_line.text.length - 1,
		});
		const next_line_indented = next_line_last_tok && token_state(next_line_last_tok).indentedCode;

		if (next_line_indented) {
			cm.replaceRange('\n', {
				line: block_end + 1,
				ch:   0,
			});
		}

		for (let i = block_start; i <= block_end; i++)
			cm.indentLine(i, 'subtract'); // TODO: this doesn't get tracked in the history, so can't be undone :(

		cm.focus();
	}
	else {
		// insert code formatting
		const no_sel_and_starting_of_line = (cur_start.line === cur_end.line && cur_start.ch === cur_end.ch && cur_start.ch === 0);
		const sel_multi = cur_start.line !== cur_end.line;
		if (no_sel_and_starting_of_line || sel_multi)
			insertFencingAtSelection(cm, cur_start, cur_end, fenceCharsToInsert);
		else
			_replaceSelection(cm, false, [ '`', '`' ]);
	}
};
