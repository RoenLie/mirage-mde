import { MirageMDE } from '../mirage-mde.js';
import { _toggleBlock } from './toggle-block.js';


/**
 * Action for toggling italic.
 */
export const toggleItalic = (editor: MirageMDE) => {
	_toggleBlock(editor, 'italic', editor.options?.blockStyles?.italic ?? '**');
};
