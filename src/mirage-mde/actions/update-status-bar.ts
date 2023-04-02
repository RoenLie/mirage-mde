import { MirageMDE } from '../mirage-mde.js';


/**
 * Update an item in the status bar.
 * @param itemName {string} The name of the item to update (ie. 'upload-image', 'autosave', etc.).
 * @param content {string} the new content of the item to write in the status bar.
 */
export const updateStatusBar = function(
	this: MirageMDE,
	itemName: string,
	content: string,
) {
	if (!this.gui.statusbar)
		return;

	const matchingClasses = this.gui.statusbar.getElementsByClassName(itemName);
	if (matchingClasses.length === 1)
		matchingClasses[0]!.textContent = content;
	else if (matchingClasses.length === 0)
		console.log('MirageMDE: status bar item ' + itemName + ' was not found.');
	else
		console.log('MirageMDE: Several status bar items named ' + itemName + ' was found.');
};
