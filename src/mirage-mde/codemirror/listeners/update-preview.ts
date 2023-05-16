import { ViewUpdate } from '@codemirror/view';
import { curryDebounce } from '@roenlie/mimic-core/timing';

import { MirageMDE } from '../../mirage-mde.js';
import { editorToPreview } from '../commands/toggle-sidebyside.js';


export const updatePreviewListener = (update: ViewUpdate, scope: MirageMDE) => {
	if ((scope.isSideBySideActive || scope.isWindowActive) && update.docChanged)
		bounced(scope);
};


const bounced = curryDebounce(500, (scope: MirageMDE) => editorToPreview(scope));
