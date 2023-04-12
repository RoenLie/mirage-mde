import { deIndent } from '@roenlie/mimic/string';

import { MMDECommand } from '../../registry/action-registry.js';
import { drawRegistry } from '../../registry/draw-registry.js';
import { replaceSelection } from '../../utilities/replace-selection.js';


/**
 * Action for opening the browse-file window to upload an image to a server.
 */
export const drawUploadedImage: MMDECommand = (view, scope) => {
	const text = deIndent(drawRegistry.get('uploadedImage') ?? '');
	replaceSelection(view, text);

	// TODO: Draw the image template with a fake url? ie: '![](importing foo.png...)'
	scope.openBrowseFileWindow();

	return true;
};
