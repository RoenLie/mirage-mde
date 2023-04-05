import { ChangeSpec } from '@codemirror/state';
import { Command } from '@codemirror/view';

import { findFirstWordToLastWord } from '../utils/string-helpers.js';


export const toggleItalic: Command = (view) => {
	const [ start, end ] = findFirstWordToLastWord(view.state)[0]!;


	const transaction = view.state.changeByRange(range => {
		const changes: ChangeSpec[] = [
			{
				from:   start,
				to:     start,
				insert: '*',
			},
			{
				from:   end,
				to:     end,
				insert: '*',
			},
		];

		return {
			changes,
			range,
		};
	});

	if (!transaction.changes.empty) {
		view.dispatch(view.state.update(transaction));
		view.dispatch({
			selection: {
				anchor: start,
				head:   end + 2,
			},
		});
	}

	return true;
};
