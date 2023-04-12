import { deIndent } from '@roenlie/mimic/string';

import { MMDECommand } from '../../registry/action-registry.js';
import { drawRegistry } from '../../registry/draw-registry.js';
import { replaceSelection } from '../../utilities/replace-selection.js';


/**
 * Action for drawing a horizontal rule.
 */
export const drawHorizontalRule: MMDECommand = (view) => {
	const text = deIndent(drawRegistry.get('horizontalRule') ?? '');
	replaceSelection(view, text);

	return true;
};
