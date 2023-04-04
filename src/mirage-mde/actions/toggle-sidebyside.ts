import { MirageMDE } from '../mirage-mde.js';


export const editorToPreview = (scope: MirageMDE) => {
	const { gui, options, editor } = scope;
	if (!gui.preview)
		return;

	const newValue = options.previewRender?.(editor.state.doc.toString()) ?? '';
	gui.preview.setContent(newValue);
};


/**
 * Toggle side by side preview
 */
export const toggleSideBySide = (scope: MirageMDE, force?: boolean) => {
	const { guiClasses, host } = scope;

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

	if (show)
		editorToPreview(scope);

	// Update host to apply new css classes.
	host?.requestUpdate();
};


export const handleEditorScroll = (ev: Event, scope: MirageMDE) => {
	const target = ev.target as HTMLElement | null;
	if (!target)
		return;

	const preview = scope.gui.preview;
	if (preview.editorScroll)
		return preview.editorScroll = false;

	preview.previewScroll = true;

	const height = target.scrollHeight - target.clientHeight;
	const ratio = target.scrollTop / height;
	const move = (preview.scrollHeight - preview.clientHeight) * ratio;

	preview.scrollTop = move;
};


export const handlePreviewScroll = (ev: Event, scope: MirageMDE) => {
	const preview = scope.gui.preview;

	if (preview.previewScroll)
		return preview.previewScroll = false;

	preview.editorScroll = true;

	const editor = scope.editor;
	const editorScrollHeight = editor.scrollDOM.scrollHeight;
	const editorClientHeight = editor.scrollDOM.clientHeight;

	const height = preview.scrollHeight - preview.clientHeight;
	const ratio = preview.scrollTop / height;
	const move = (editorScrollHeight - editorClientHeight) * ratio;

	editor.scrollDOM.scrollTo(0, move);
};
