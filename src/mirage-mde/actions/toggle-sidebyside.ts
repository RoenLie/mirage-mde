import { MirageMDE } from '../mirage-mde.js';


let editorToPreview = (
	scope: MirageMDE,
) => {
	const { gui, options, editor } = scope;
	if (!gui.preview)
		return;

	const newValue = options.previewRender?.(editor.state.sliceDoc()) ?? '';
	gui.preview.setContent(newValue);
};


/**
 * Toggle side by side preview
 */
export const toggleSideBySide = (scope: MirageMDE, force?: boolean) => {
	const { guiClasses, options: { host } } = scope;
	const cm = scope.codemirror;
	const show = !(force ?? host?.classList.contains('sidebyside'));
	const previewButton = scope.toolbarElements['preview']?.value;
	const sidebysideButton = scope.toolbarElements['side-by-side']?.value;

	if (show) {
		guiClasses.editor['hidden'] = false;
		guiClasses.preview['hidden'] = false;
		host?.classList.toggle('sidebyside', true);
		host?.classList.toggle('preview', false);
		previewButton?.classList.toggle('active', false);
		sidebysideButton?.classList.toggle('active', true);
	}
	else {
		guiClasses.editor['hidden'] = false;
		guiClasses.preview['hidden'] = true;
		host?.classList.toggle('sidebyside', false);
		sidebysideButton?.classList.toggle('active', false);
	}

	if (show) {
		//
		editorToPreview(scope);
		//cm.on('update', () => editorToPreview(editor));
	}
	else {
		//cm.off('update', () => editorToPreview(editor));
	}

	// Update host to apply new css classes.
	host?.requestUpdate();

	// Refresh to rerender text after.
	//setTimeout(() => cm.refresh());
};
