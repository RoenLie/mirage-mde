import { MirageMDE } from '../mirage-mde.js';


/**
 * Action for opening the browse-file window to upload an image to a server.
 */
export const drawUploadedImage = (editor: MirageMDE) => {
	// TODO: Draw the image template with a fake url? ie: '![](importing foo.png...)'
	editor.openBrowseFileWindow();
};
