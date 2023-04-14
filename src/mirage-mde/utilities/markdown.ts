import { MirageMDE } from '../mirage-mde.js';
import { addAnchorTargetBlank } from './add-anchor-target.js';


/**
 * Default markdown render.
 */
export const markdown = async (scope: MirageMDE, text: string) => {
	const [ marked, hljs ] = await Promise.all([
		import('marked').then(m => m.marked),
		import('highlight.js').then(m => m.default),
	]);

	const { renderingConfig } = scope.options;

	// Initialize
	const markedOptions = renderingConfig?.markedOptions ?? {};
	markedOptions.breaks = !(renderingConfig?.singleLineBreaks === false);

	if (renderingConfig?.codeSyntaxHighlighting === true) {
		markedOptions.highlight = (code, language) => {
			return language && hljs.getLanguage(language)
				? hljs.highlight(code, { language }).value
				: hljs.highlightAuto(code).value;
		};
	}

	// Set options
	marked.setOptions(markedOptions);

	// Custom async replacement pipeline.
	for (const { regexp, replacer } of renderingConfig?.preprocessor ?? [])
		text = await replaceAsync(text, regexp, replacer);

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


const replaceAsync = async (
	text: string,
	regexp: RegExp,
	replacerFunction: (...match: string[]) => string | Promise<string>,
) => {
	const replacements = await Promise.all(
		Array.from(text.matchAll(regexp),
			match => replacerFunction(...match)),
	);

	let i = 0;

	return text.replace(regexp, () => replacements[i++]!);
};
