import { MirageMDE } from '../mirage-mde.js';


let saved_overflow = '';
let saved_height = '';


/**
 * Toggle full screen of the editor.
 */
export const toggleFullScreen = (
	editor: MirageMDE,
) => {
	// Set fullscreen
	const cm = editor.codemirror;
	cm.setOption('fullScreen', !cm.getOption('fullScreen'));
	const fullscreenState = cm.getOption('fullScreen');

	const { options: { host } } = editor;

	// Prevent scrolling on body during fullscreen active
	if (fullscreenState) {
		saved_overflow = document.body.style.overflow;
		saved_height = host?.style.height ?? '';
		document.body.style.setProperty('overflow', 'hidden');
		host?.style.setProperty('height', null);
	}
	else {
		document.body.style.setProperty('overflow', saved_overflow);
		host?.style.setProperty('height', saved_height);
	}

	host?.classList.toggle('fullscreen', fullscreenState);
	host?.requestUpdate();

	// Update toolbar button
	editor.toolbarElements['fullscreen']?.value?.classList.toggle('active');
};
