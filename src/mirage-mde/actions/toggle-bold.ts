import { MirageMDE } from '../mirage-mde.js';
import { _toggleBlock } from './toggle-block.js';


/**
 * Action for toggling bold.
 */
export const toggleBold = (editor: MirageMDE) => {
	_toggleBlock(editor, 'bold', editor.options?.blockStyles?.bold ?? '*');
};
