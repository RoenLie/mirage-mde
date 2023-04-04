import { ChangeSpec } from '@codemirror/state';
import { Command } from '@codemirror/view';


export const toggleItalic: Command = (view) => {
	const transaction = view.state.changeByRange(range => {
		const changes: ChangeSpec[] = [
			{
				from:   range.from,
				to:     range.from,
				insert: '*',
			},
			{
				from:   range.to,
				to:     range.to,
				insert: '*',
			},
		];

		return {
			changes,
			range,
		};
	});

	if (!transaction.changes.empty) {
		const { from, to } = view.state.selection.ranges[0]!;

		view.dispatch(view.state.update(transaction));
		view.dispatch({
			selection: {
				anchor: from,
				head:   to + 2,
			},
		});
	}

	return true;
};
