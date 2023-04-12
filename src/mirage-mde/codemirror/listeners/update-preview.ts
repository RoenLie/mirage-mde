import { ViewUpdate } from '@codemirror/view';

import { MirageMDE } from '../../mirage-mde.js';
import { editorToPreview } from '../commands/toggle-sidebyside.js';


export const updatePreviewListener = (update: ViewUpdate, scope: MirageMDE) => {
	if (scope.isSideBySideActive || scope.isWindowActive) {
		if (update.docChanged)
			editorToPreview(scope);
	}
};
