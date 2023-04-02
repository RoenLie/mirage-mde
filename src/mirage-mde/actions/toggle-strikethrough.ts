import { MirageMDE } from '../mirage-mde.js';
import { _toggleBlock } from './toggle-block.js';


/**
 * Action for toggling strikethrough.
 */
export const toggleStrikethrough = (editor: MirageMDE) => {
	_toggleBlock(editor, 'strikethrough', '~~');
};
