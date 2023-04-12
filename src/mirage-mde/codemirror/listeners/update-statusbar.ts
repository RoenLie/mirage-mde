import { EditorView, ViewUpdate } from '@codemirror/view';
import { weakmapGetLazy } from '@roenlie/mimic/structs';

import { MirageMDE } from '../../mirage-mde.js';
import { statusRegistry } from '../../registry/status-registry.js';


const metadata = new WeakMap<EditorView, {initialized: boolean;}>();


export const updateStatusbarListener = (update: ViewUpdate, scope: MirageMDE) => {
	const meta = weakmapGetLazy(metadata, scope.editor, () => ({ initialized: false }));
	if (!meta.initialized) {
		meta.initialized = true;

		statusRegistry.forEach(status => {
			status.initialize?.(status, update, scope);
		});
	}

	if (update.selectionSet) {
		statusRegistry.forEach(status => {
			status.onActivity?.(status, update, scope);
		});
	}

	if (update.docChanged) {
		statusRegistry.forEach(status => {
			status.onUpdate?.(status, update, scope);
		});
	}

	statusRegistry.forEach(status => {
		status.onAnyUpdate?.(status, update, scope);
	});

	scope.gui.statusbar.requestUpdate();
};
