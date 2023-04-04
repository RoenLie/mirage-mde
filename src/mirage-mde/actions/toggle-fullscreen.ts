import { MirageMDE } from '../mirage-mde.js';


const state = new WeakMap<MirageMDE, {
	savedOverflow: string;
	savedHeight: string;
}>();


/**
 * Toggle full screen of the editor.
 */
export const toggleFullScreen = (editor: MirageMDE) => {
	const { host } = editor;

	const saved = state.get(editor) ?? { savedHeight: '', savedOverflow: '' };

	const fullscreenState = !host.classList.contains('fullscreen');

	// Prevent scrolling on body during fullscreen active
	if (fullscreenState) {
		saved.savedHeight = host?.style.height ?? '';
		saved.savedOverflow = document.body.style.overflow;

		document.body.style.setProperty('overflow', 'hidden');
		host?.style.setProperty('height', null);
	}
	else {
		document.body.style.setProperty('overflow', saved.savedOverflow);
		host?.style.setProperty('height', saved.savedHeight);
	}

	host?.classList.toggle('fullscreen', fullscreenState);
	host?.requestUpdate();

	// Update toolbar button
	editor.toolbarElements['fullscreen']?.value?.classList.toggle('active');

	state.set(editor, saved);
};
