import { ViewUpdate } from '@codemirror/view';

import { getNodesInRange } from './get-state.js';


export const updateToolbarStateListener = (update: ViewUpdate) => {
	if (!update.selectionSet)
		return;

	update.state.selection.ranges.forEach(range => {
		getNodesInRange(update.state, range);
	});
};
