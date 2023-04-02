import { MirageMDE } from '../mirage-mde.js';
import { escapePromptURL } from '../utilities/escape-prompt-url.js';
import { _toggleLink } from './toggle-link.js';


/**
 * Action for drawing an img.
 */
export const drawImage = (editor: MirageMDE) => {
	const options = editor.options;
	let url = 'https://';
	if (options.promptURLs) {
		const result = prompt(options.promptTexts?.image, url);
		if (!result)
			return false;

		url = escapePromptURL(result);
	}

	_toggleLink(editor, 'image', options.insertTexts?.image as any, url);
};
