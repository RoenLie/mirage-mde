import { ViewUpdate } from '@codemirror/view';

import { editorToPreview } from '../../actions/toggle-sidebyside.js';
import { MirageMDE } from '../../mirage-mde.js';


export const updatePreviewListener = (update: ViewUpdate, scope: MirageMDE) => {
	if (scope.isSideBySideActive) {
		if (update.docChanged)
			editorToPreview(scope);
	}
};
