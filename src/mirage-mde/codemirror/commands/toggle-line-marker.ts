import { ChangeSpec, EditorSelection } from '@codemirror/state';
import { EditorView } from 'codemirror';

import { getNodesInRange, LineMarker, lineMarkerValue } from '../listeners/get-state.js';
import { arrayObjSum } from '../utils/array-helpers.js';
import { isRangeInRanges } from '../utils/is-range-in-ranges.js';
import { cmFindBeginningOfWord, cmfindEndOfWord } from '../utils/string-helpers.js';


export const toggleLineMarker = (view: EditorView, marker: LineMarker) => {
	const state = view.state;
	const ranges = view.state.selection.ranges;
	const markerValue = lineMarkerValue[marker];

	const activeMarkers = ranges.flatMap(range => getNodesInRange(state, range));

	// Remove any active marker.
	// If there were any markers to remove, dispatch those changes and finish.
	let transaction = state.changeByRange(range => {
		const changes: ChangeSpec[] = [];

		activeMarkers.forEach(node => {
			if (!isRangeInRanges([ range ], node))
				return;
			if (node.marker !== marker)
				return;

			changes.push(
				{
					from:   node.from,
					to:     node.from + markerValue.length,
					insert: '',
				},
				{
					from:   node.to - markerValue.length,
					to:     node.to,
					insert: '',
				},
			);
		});

		return {
			changes,
			range: EditorSelection.range(
				range.from,
				range.to - (changes.length * markerValue.length),
			),
		};
	});

	if (!transaction.changes.empty) {
		view.dispatch(view.state.update(transaction));

		return true;
	}


	// If there were no markers to remove. apply marker to the selected ranges
	transaction = view.state.changeByRange(range => {
		let from = range.from;
		let to = range.to;

		// If the from/to is the same, find the beginning and end
		// of the word and use those ranges instead.
		if (from === to) {
			from = cmFindBeginningOfWord(from, state) ?? from;
			to = cmfindEndOfWord(to, state) ?? from;
		}

		const changes: ChangeSpec[] = [
			{
				from:   from,
				to:     from,
				insert: markerValue,
			},
			{
				from:   to,
				to:     to,
				insert: markerValue,
			},
		];

		return {
			changes,
			range: EditorSelection.range(
				from,
				to + arrayObjSum(changes, (c: any) => c.insert.length),
			),
		};
	});

	if (!transaction.changes.empty)
		view.dispatch(view.state.update(transaction));


	return true;
};
