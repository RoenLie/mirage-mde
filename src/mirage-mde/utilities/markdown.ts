import { marked } from 'marked';

import { MirageMDE } from '../mirage-mde.js';
import { addAnchorTargetBlank } from './add-anchor-target.js';


/**
 * Default markdown render.
 */
export const markdown = (editor: MirageMDE, text: string) => {
	if (!marked)
		return;

	const { renderingConfig } = editor.options;

	// Initialize
	const markedOptions = renderingConfig?.markedOptions ?? {};

	markedOptions.breaks = !!(renderingConfig?.singleLineBreaks === false);

	if (renderingConfig?.codeSyntaxHighlighting === true && renderingConfig.hljs) {
		markedOptions.highlight = (code, language) => {
			return language && renderingConfig.hljs.getLanguage(language)
				? renderingConfig.hljs.highlight(code, { language }).value
				: renderingConfig.hljs.highlightAuto(code).value;
		};
	}

	// Set options
	marked.setOptions(markedOptions);

	// Convert the markdown to HTML
	let htmlText = marked.parse(text);

	// Sanitize HTML
	if (typeof renderingConfig?.sanitizerFunction === 'function')
		htmlText = renderingConfig.sanitizerFunction(htmlText);

	// Edit the HTML anchors to add 'target="_blank"' by default.
	htmlText = addAnchorTargetBlank(htmlText);

	// Remove list-style when rendering checkboxes
	htmlText = removeListStyleWhenCheckbox(htmlText);

	return htmlText;
};


/**
 * Modify HTML to remove the list-style when rendering checkboxes.
 * @return The modified HTML text.
 */
export const removeListStyleWhenCheckbox = (htmlText: string): string => {
	const parser = new DOMParser();
	const htmlDoc = parser.parseFromString(htmlText, 'text/html');
	const listItems = htmlDoc.getElementsByTagName('li');

	for (let i = 0; i < listItems.length; i++) {
		const listItem = listItems[i]!;

		for (let j = 0; j < listItem.children.length; j++) {
			const listItemChild = listItem.children[j]!;

			if (listItemChild instanceof HTMLInputElement && listItemChild.type === 'checkbox') {
				// From Github: margin: 0 .2em .25em -1.6em;
				listItem.style.marginLeft = '-1.5em';
				listItem.style.listStyleType = 'none';
			}
		}
	}

	return htmlDoc.documentElement.innerHTML;
};
