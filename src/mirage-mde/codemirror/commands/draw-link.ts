import { deIndent } from '@roenlie/mimic/string';

import { MMDECommand } from '../../registry/action-registry.js';
import { drawRegistry } from '../../registry/draw-registry.js';
import { replaceSelection } from '../../utilities/replace-selection.js';


/**
 * Action for drawing a link.
 */
export const drawLink: MMDECommand = (view) => {
	const text = deIndent(drawRegistry.get('link') ?? '');
	replaceSelection(view, text);

	return true;
};
