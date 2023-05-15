import { ViewUpdate } from '@codemirror/view';
import { curryDebounce } from '@roenlie/mimic-core/timing';

import { MirageMDE } from '../../mirage-mde.js';
import { editorToPreview } from '../commands/toggle-sidebyside.js';


export const updatePreviewListener = curryDebounce(500, (update: ViewUpdate, scope: MirageMDE) => {
	if (scope.isSideBySideActive || scope.isWindowActive) {
		if (update.docChanged)
			editorToPreview(scope);
	}
});
