import { type MirageMDE } from '../mirage-mde.js';
import { type ToolbarButton } from '../mirage-mde-types.js';


export const action = (item: ToolbarButton, scope: MirageMDE) => {
	return () => {
		if (typeof item.action === 'function')
			item.action(scope);
		if (typeof item.action === 'string')
			globalThis.open(item.action, '_blank');
	};
};
