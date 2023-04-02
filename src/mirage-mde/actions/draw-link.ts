import { MirageMDE } from '../mirage-mde.js';
import { escapePromptURL } from '../utilities/escape-prompt-url.js';
import { _toggleLink } from './toggle-link.js';


/**
 * Action for drawing a link.
 */
export const drawLink = (editor: MirageMDE) => {
	const options = editor.options;
	let url = 'https://';
	if (options.promptURLs) {
		const result = prompt(options.promptTexts?.link, url);
		if (!result)
			return false;

		url = escapePromptURL(result);
	}

	_toggleLink(editor, 'link', options.insertTexts!.link as any, url);
};
