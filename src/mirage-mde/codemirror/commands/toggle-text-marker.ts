import { ChangeSpec, EditorSelection } from '@codemirror/state';
import { Command, EditorView } from '@codemirror/view';

import { getNodesInRange, Marker, TextMarker, textMarkerValue } from '../listeners/get-state.js';
import { arrayObjSum } from '../utils/array-helpers.js';
import { isRangeInRanges } from '../utils/is-range-in-ranges.js';
import { cmFindBeginningOfWord, cmfindEndOfWord } from '../utils/string-helpers.js';


export const toggleStrikethrough: Command = (view) => toggleTextMarker(view, 'strikethrough');
export const toggleItalic: Command = (view) => toggleTextMarker(view, 'italic');
export const toggleBold: Command = (view) => toggleTextMarker(view, 'bold');


export const toggleTextMarker = (view: EditorView, marker: TextMarker) => {
	const state = view.state;
	const ranges = view.state.selection.ranges;
	const markerValue = textMarkerValue[marker];

	const activeMarkers = ranges.flatMap(range => getNodesInRange(state, range));

	// Remove any active italic styles.
	// If there were any italic styles to remove, dispatch those changes and finish.
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


	// If there were no italics to remove. apply italic to the selected ranges
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
