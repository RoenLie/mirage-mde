import CodeMirror from 'codemirror';

import { MirageMDEMethods } from './mirage-mde.js';
import { ToolbarItem } from './mirage-mde-types.js';


type RecordOf<T, K extends keyof any, V> = T & Record<K, V>;


// Some variables
const isMac = /Mac/.test(navigator.platform);
const anchorToExternalRegex = new RegExp(/(<a.*?https?:\/\/.*?[^a]>)+?/g);


// Saved overflow setting
let saved_overflow = '';


const _replaceSelection = (cm: CodeMirror.Editor, active: boolean, startEnd: [string, string], url?: string) => {
	const lastElement = cm.getWrapperElement().lastElementChild as HTMLElement | null;
	if (lastElement?.classList.contains('editor-preview-active'))
		return;

	let text;
	let start = startEnd[0]!;
	let end = startEnd[1]!;
	const startPoint: any = {};
	const endPoint: any = {};
	Object.assign(startPoint, cm.getCursor('start'));
	Object.assign(endPoint, cm.getCursor('end'));

	if (url) {
		start = start.replace('#url#', url);  // url is in start for upload-image
		end = end.replace('#url#', url);
	}

	if (active) {
		text = cm.getLine(startPoint.line);
		start = text.slice(0, startPoint.ch);
		end = text.slice(startPoint.ch);
		cm.replaceRange(start + end, {
			line: startPoint.line,
			ch:   0,
		});
	}
	else {
		text = cm.getSelection();
		cm.replaceSelection(start + text + end);

		startPoint.ch += start.length;
		if (startPoint !== endPoint)
			endPoint.ch += start.length;
	}

	cm.setSelection(startPoint, endPoint);
	cm.focus();
};


const _toggleHeading = (cm: CodeMirror.Editor, direction: string | undefined, size = 1) => {
	const lastElement = cm.getWrapperElement().lastElementChild as HTMLElement | null;
	if (lastElement?.classList.contains('editor-preview-active'))
		return;

	const startPoint = cm.getCursor('start');
	const endPoint = cm.getCursor('end');
	for (let i = startPoint.line; i <= endPoint.line; i++) {
		(function(i) {
			let text = cm.getLine(i);
			const currHeadingLevel = text.search(/[^#]/);

			if (direction !== undefined) {
				if (currHeadingLevel <= 0) {
					if (direction == 'bigger')
						text = '###### ' + text;
					else
						text = '# ' + text;
				}
				else if (currHeadingLevel == 6 && direction == 'smaller') {
					text = text.substr(7);
				}
				else if (currHeadingLevel == 1 && direction == 'bigger') {
					text = text.substr(2);
				}
				else {
					if (direction == 'bigger')
						text = text.substr(1);
					else
						text = '#' + text;
				}
			}
			else {
				if (currHeadingLevel <= 0)
					text = '#'.repeat(size) + ' ' + text;
				else if (currHeadingLevel == size)
					text = text.substring(currHeadingLevel + 1);
				else
					text = '#'.repeat(size) + ' ' + text.substr(currHeadingLevel + 1);
			}

			cm.replaceRange(text, {
				line: i,
				ch:   0,
			}, {
				line: i,
				ch:   99999999999999,
			});
		})(i);
	}
	cm.focus();
};


const _toggleLine = (cm: CodeMirror.Editor, name: string, liststyle: string) => {
	const lastElement = cm.getWrapperElement().lastElementChild as HTMLElement | null;
	if (lastElement?.classList.contains('editor-preview-active'))
		return;

	const quoteRegexp = /^(\s*)>\s+/;
	const listRegexp = /^(\s*)(\*|-|\+|\d*\.)(\s+)/;
	const whitespacesRegexp = /^\s*/;

	const stat = getState(cm);
	const startPoint = cm.getCursor('start');
	const endPoint = cm.getCursor('end');
	const repl: Record<string, RegExp> = {
		'quote':          quoteRegexp,
		'unordered-list': listRegexp,
		'ordered-list':   listRegexp,
	};

	const _getChar = (name: string, i: string) => {
		const map: Record<string, string> = {
			'quote':          '>',
			'unordered-list': liststyle,
			'ordered-list':   '%%i.',
		};

		return map[name]?.replace('%%i', i);
	};

	const _checkChar = (name: string, char: string) => {
		const map: Record<string, string> = {
			'quote':          '>',
			'unordered-list': '\\' + liststyle,
			'ordered-list':   '\\d+.',
		};
		const rt = new RegExp(map[name] ?? '');

		return char && rt.test(char);
	};

	const _toggle = (name: string, text: string, untoggleOnly: boolean) => {
		const arr = listRegexp.exec(text);
		let char = _getChar(name, String(line));
		if (arr !== null) {
			if (_checkChar(name, arr[2]!))
				char = '';

			text = arr[1]! + char + arr[3] + text.replace(whitespacesRegexp, '').replace(repl[name]!, '$1');
		}
		else if (untoggleOnly == false) {
			text = char + ' ' + text;
		}

		return text;
	};

	let line = 1;
	for (let i = startPoint.line; i <= endPoint.line; i++) {
		let text = cm.getLine(i);

		if (stat[name]) {
			text = text.replace(repl[name]!, '$1');
		}
		else {
			// If we're toggling unordered-list formatting, check if the current line
			// is part of an ordered-list, and if so, untoggle that first.
			// Workaround for https://github.com/Ionaru/easy-markdown-editor/issues/92
			if (name == 'unordered-list')
				text = _toggle('ordered-list', text, true);

			text = _toggle(name, text, false);
			line += 1;
		}

		cm.replaceRange(text, {
			line: i,
			ch:   0,
		}, {
			line: i,
			ch:   99999999999999,
		});
	}

	cm.focus();
};


const _toggleLink = (editor: MirageMDEMethods, type: 'link' | 'image', startEnd: [string, string], url: string) => {
	if (!editor.codemirror || editor.isPreviewActive())
		return;

	const cm = editor.codemirror;
	const stat = getState(cm);
	const active = stat[type]!;
	if (!active) {
		_replaceSelection(cm, active, startEnd, url);

		return;
	}

	const startPoint = cm.getCursor('start');
	const endPoint = cm.getCursor('end');
	const text = cm.getLine(startPoint.line);
	let start = text.slice(0, startPoint.ch);
	let end = text.slice(startPoint.ch);

	if (type == 'link')
		start = start.replace(/(.*)[^!]\[/, '$1');
	else if (type == 'image')
		start = start.replace(/(.*)!\[$/, '$1');

	end = end.replace(/]\(.*?\)/, '');

	cm.replaceRange(start + end, {
		line: startPoint.line,
		ch:   0,
	}, {
		line: startPoint.line,
		ch:   99999999999999,
	});

	startPoint.ch -= startEnd[0].length;
	if (startPoint !== endPoint)
		endPoint.ch -= startEnd[0].length;

	cm.setSelection(startPoint, endPoint);
	cm.focus();
};


const _toggleBlock = (editor: MirageMDEMethods, type: string, start_chars: string, end_chars?: string) => {
	if (!editor.codemirror || editor.isPreviewActive())
		return;

	end_chars = (typeof end_chars === 'undefined') ? start_chars : end_chars;
	const cm = editor.codemirror;
	const stat = getState(cm);

	let text;
	let start = start_chars;
	let end = end_chars;

	const startPoint = cm.getCursor('start');
	const endPoint = cm.getCursor('end');

	if (stat[type]) {
		text = cm.getLine(startPoint.line);
		start = text.slice(0, startPoint.ch);
		end = text.slice(startPoint.ch);
		if (type == 'bold') {
			start = start.replace(/(\*\*|__)(?![\s\S]*(\*\*|__))/, '');
			end = end.replace(/(\*\*|__)/, '');
		}
		else if (type == 'italic') {
			start = start.replace(/(\*|_)(?![\s\S]*(\*|_))/, '');
			end = end.replace(/(\*|_)/, '');
		}
		else if (type == 'strikethrough') {
			start = start.replace(/(\*\*|~~)(?![\s\S]*(\*\*|~~))/, '');
			end = end.replace(/(\*\*|~~)/, '');
		}

		cm.replaceRange(start + end, {
			line: startPoint.line,
			ch:   0,
		}, {
			line: startPoint.line,
			ch:   99999999999999,
		});

		if (type == 'bold' || type == 'strikethrough') {
			startPoint.ch -= 2;
			if (startPoint !== endPoint)
				endPoint.ch -= 2;
		}
		else if (type == 'italic') {
			startPoint.ch -= 1;
			if (startPoint !== endPoint)
				endPoint.ch -= 1;
		}
	}
	else {
		text = cm.getSelection();
		if (type == 'bold') {
			text = text.split('**').join('');
			text = text.split('__').join('');
		}
		else if (type == 'italic') {
			text = text.split('*').join('');
			text = text.split('_').join('');
		}
		else if (type == 'strikethrough') {
			text = text.split('~~').join('');
		}

		cm.replaceSelection(start + text + end);

		startPoint.ch += start_chars.length;
		endPoint.ch = startPoint.ch + text.length;
	}

	cm.setSelection(startPoint, endPoint);
	cm.focus();
};


const _cleanBlock = (cm: CodeMirror.Editor) => {
	const lastElement = cm.getWrapperElement().lastElementChild as HTMLElement | null;
	if (lastElement?.classList.contains('editor-preview-active'))
		return;

	const startPoint = cm.getCursor('start');
	const endPoint = cm.getCursor('end');
	let text;

	for (let line = startPoint.line; line <= endPoint.line; line++) {
		text = cm.getLine(line);
		text = text.replace(/^[ ]*([# ]+|\*|-|[> ]+|[0-9]+(.|\)))[ ]*/, '');

		cm.replaceRange(text, {
			line: line,
			ch:   0,
		}, {
			line: line,
			ch:   99999999999999,
		});
	}
};


// Merge the properties of one object into another.
const _mergeProperties = (target: Record<keyof any, any>, source: Record<keyof any, any>) => {
	for (let property in source) {
		if (Object.prototype.hasOwnProperty.call(source, property)) {
			if (source[property] instanceof Array)
				target[property] = source[property].concat(target[property] instanceof Array ? target[property] : []);
			else if (
				source[property] !== null &&
                typeof source[property] === 'object' &&
                source[property].constructor === Object
			)
				target[property] = _mergeProperties(target[property] || {}, source[property]);
			else
				target[property] = source[property];
		}
	}

	return target;
};


export const getBindingName = (f: (editor: MirageMDEMethods) => any) => {
	for (let key in bindings) {
		if (bindings[key] === f)
			return key;
	}

	return null;
};


export const isMobile = () => {
	let check = false;
	((a) => {
		// eslint-disable-next-line max-len
		const regOriginal: RegExp = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i as any;

		if (regOriginal.test(a.substr(0, 4)))
			check = true;
	})(
		navigator.userAgent
		|| navigator.vendor
		|| (window as any).opera,
	);

	return check;
};


/**
 * Modify HTML to add 'target="_blank"' to links so they open in new tabs by default.
 * @return The modified HTML text.
 */
export const addAnchorTargetBlank = (htmlText: string): string => {
	let match;
	while ((match = anchorToExternalRegex.exec(/** HTML to be modified. */ htmlText)) !== null) {
		// With only one capture group in the RegExp, we can safely take the first index from the match.
		const linkString = match[0];

		if (linkString.indexOf('target=') === -1) {
			const fixedLinkString = linkString.replace(/>$/, ' target="_blank">');
			htmlText = htmlText.replace(linkString, fixedLinkString);
		}
	}

	return htmlText;
};


/**
 * Modify HTML to remove the list-style when rendering checkboxes.
 * @return The modified HTML text.
 */
export const removeListStyleWhenCheckbox = (/** HTML to be modified. */ htmlText: string): string => {
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


/**
 * Fix shortcut. Mac use Command, others use Ctrl.
 */
export const fixShortcut = (name: string) => {
	if (isMac)
		name = name.replace('Ctrl', 'Cmd');
	else
		name = name.replace('Cmd', 'Ctrl');

	return name;
};


/**
 * Create dropdown block
 */
export const createToolbarDropdown = (
	options: any,
	enabletooltips: any,
	shortcuts: Shortcuts,
	parent: MirageMDEMethods,
) => {
	const el = createToolbarButton(options, false, enabletooltips, shortcuts, 'button', parent);
	el.classList.add('easymde-dropdown');

	el.onclick = () => void el.focus();

	const content = document.createElement('div');
	content.className = 'easymde-dropdown-content';
	for (let childrenIndex = 0; childrenIndex < options.children.length; childrenIndex++) {
		const child = options.children[childrenIndex];
		let childElement;

		if (typeof child === 'string' && child in toolbarBuiltInButtons)
			childElement = createToolbarButton(toolbarBuiltInButtons[child], true, enabletooltips, shortcuts, 'button', parent);
		else
			childElement = createToolbarButton(child, true, enabletooltips, shortcuts, 'button', parent);

		childElement.addEventListener('click', (e: MouseEvent) => void e.stopPropagation(), false);
		content.appendChild(childElement);
	}
	el.appendChild(content);

	return el;
};


/**
 * Create button element for toolbar.
 */
export const createToolbarButton = (
	options: any,
	enableActions: boolean,
	enabletooltips: boolean,
	shortcuts: Shortcuts,
	markup: string,
	parent: MirageMDEMethods,
) => {
	options ??= {};
	const el = document.createElement(markup);

	// Add 'custom' attributes as early as possible, so that 'official' attributes will never be overwritten.
	if (options.attributes) {
		for (let attribute in options.attributes) {
			if (Object.prototype.hasOwnProperty.call(options.attributes, attribute))
				el.setAttribute(attribute, options.attributes[attribute]);
		}
	}

	const classNamePrefix = parent.options.toolbarButtonClassPrefix ? parent.options.toolbarButtonClassPrefix + '-' : '';
	el.className = classNamePrefix + options.name;
	el.setAttribute('type', markup);
	enabletooltips = (enabletooltips == undefined) ? true : enabletooltips;

	if (options.text)
		el.innerText = options.text;


	// Properly handle custom shortcuts
	if (options.name && options.name in shortcuts)
		bindings[options.name] = options.action;


	if (options.title && enabletooltips) {
		el.title = createTooltip(options.title, options.action, shortcuts);

		if (isMac) {
			el.title = el.title.replace('Ctrl', '⌘');
			el.title = el.title.replace('Alt', '⌥');
		}
	}

	if (options.title)
		el.setAttribute('aria-label', options.title);


	if (options.noDisable)
		el.classList.add('no-disable');


	if (options.noMobile)
		el.classList.add('no-mobile');


	// Prevent errors if there is no class name in custom options
	let classNameParts = [];
	if (typeof options.className !== 'undefined')
		classNameParts = options.className.split(' ');


	// Provide backwards compatibility with simple-markdown-editor by adding custom classes to the button.
	const iconClasses = [];
	for (let classNameIndex = 0; classNameIndex < classNameParts.length; classNameIndex++) {
		const classNamePart = classNameParts[classNameIndex];
		// Split icon classes from the button.
		// Regex will detect "fa", "fas", "fa-something" and "fa-some-icon-1", but not "fanfare".
		if (classNamePart.match(/^fa([srlb]|(-[\w-]*)|$)/))
			iconClasses.push(classNamePart);
		else
			el.classList.add(classNamePart);
	}

	el.tabIndex = -1;

	if (iconClasses.length > 0) {
		// Create icon element and append as a child to the button
		const icon = document.createElement('i');
		for (let iconClassIndex = 0; iconClassIndex < iconClasses.length; iconClassIndex++) {
			const iconClass = iconClasses[iconClassIndex];
			icon.classList.add(iconClass);
		}
		el.appendChild(icon);
	}

	// If there is a custom icon markup set, use that
	if (typeof options.icon !== 'undefined')
		el.innerHTML = options.icon;


	if (options.action && enableActions) {
		if (typeof options.action === 'function') {
			el.onclick = function(e) {
				e.preventDefault();
				options.action(parent);
			};
		}
		else if (typeof options.action === 'string') {
			el.onclick = function(e) {
				e.preventDefault();
				window.open(options.action, '_blank');
			};
		}
	}

	return el;
};


export const createSep = () => {
	const el = document.createElement('i');
	el.className = 'separator';
	el.innerHTML = '|';

	return el;
};


export const createTooltip = (title: string, action: (editor: MirageMDEMethods) => any, shortcuts: Shortcuts) => {
	let actionName: string | null;
	let tooltip = title;

	if (action) {
		actionName = getBindingName(action);
		if (actionName && shortcuts[actionName])
			tooltip += ' (' + fixShortcut(shortcuts[actionName]!) + ')';
	}

	return tooltip;
};


/**
 * The state of CodeMirror at the given position.
 */
export const getState = (cm: CodeMirror.Editor, pos?: CodeMirror.Position) => {
	pos = pos || cm.getCursor('start');
	const stat = cm.getTokenAt(pos);
	if (!stat.type)
		return {};

	const types = stat.type.split(' ');

	const ret: Partial<{
		[key: string]: boolean;
		bold: boolean;
		'ordered-list': boolean;
		'unordered-list': boolean;
		quote: boolean;
		italic: boolean;
		strikethrough: boolean;
		code: boolean;
		image: boolean;
		link: boolean;
		table: boolean;
	}> = {};

	let data;
	let text;

	for (let i = 0; i < types.length; i++) {
		data = types[i];
		if (data === 'strong') {
			ret.bold = true;
		}
		else if (data === 'constiable-2') {
			text = cm.getLine(pos.line);
			if (/^\s*\d+\.\s/.test(text))
				ret['ordered-list'] = true;
			else
				ret['unordered-list'] = true;
		}
		else if (data === 'atom') {
			ret.quote = true;
		}
		else if (data === 'em') {
			ret.italic = true;
		}
		else if (data === 'quote') {
			ret.quote = true;
		}
		else if (data === 'strikethrough') {
			ret.strikethrough = true;
		}
		else if (data === 'comment') {
			ret.code = true;
		}
		else if (data === 'link' && !ret.image) {
			ret.link = true;
		}
		else if (data === 'image') {
			ret.image = true;
		}
		else if (data?.match(/^header(-[1-6])?$/)) {
			ret[data.replace('header', 'heading')] = true;
		}
	}

	return ret;
};


/**
 * Toggle full screen of the editor.
 */
export const toggleFullScreen = (editor: MirageMDEMethods) => {
	// Set fullscreen
	const cm = editor.codemirror;
	cm.setOption('fullScreen', !cm.getOption('fullScreen'));

	// Prevent scrolling on body during fullscreen active
	if (cm.getOption('fullScreen')) {
		saved_overflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
	}
	else {
		document.body.style.overflow = saved_overflow;
	}

	const wrapper = cm.getWrapperElement();
	const sidebyside = wrapper.nextElementSibling as HTMLElement | null;

	if (sidebyside?.classList.contains('editor-preview-active-side')) {
		if (editor.options.sideBySideFullscreen === false) {
			// if side-by-side not-fullscreen ok, apply classes as needed
			const mdeContainer = wrapper.parentElement as HTMLElement | null;
			if (cm.getOption('fullScreen'))
				mdeContainer?.classList.remove('sided--no-fullscreen');
			else
				mdeContainer?.classList.add('sided--no-fullscreen');
		}
		else {
			toggleSideBySide(editor);
		}
	}

	if (editor.options.onToggleFullScreen)
		editor.options.onToggleFullScreen(cm.getOption('fullScreen') || false);

	// Remove or set maxHeight
	if (typeof editor.options.maxHeight !== 'undefined') {
		if (cm.getOption('fullScreen')) {
			cm.getScrollerElement().style.removeProperty('height');
			sidebyside?.style.removeProperty('height');
		}
		else {
			cm.getScrollerElement().style.height = editor.options.maxHeight;
			editor.setPreviewMaxHeight();
		}
	}

	// Update toolbar class
	editor.toolbar_div.classList.toggle('fullscreen');

	// Update toolbar button
	if (editor.toolbarElements && editor.toolbarElements['fullscreen']) {
		const toolbarButton = editor.toolbarElements['fullscreen'];
		toolbarButton.classList.toggle('active');
	}
};


/**
 * Action for toggling bold.
 */
export const toggleBold = (editor: MirageMDEMethods) => {
	_toggleBlock(editor, 'bold', editor.options?.blockStyles?.bold ?? '*');
};


/**
 * Action for toggling italic.
 */
export const toggleItalic = (editor: MirageMDEMethods) => {
	_toggleBlock(editor, 'italic', editor.options?.blockStyles?.italic ?? '**');
};


/**
 * Action for toggling strikethrough.
 */
export const toggleStrikethrough = (editor: MirageMDEMethods) => {
	_toggleBlock(editor, 'strikethrough', '~~');
};

/**
 * Action for toggling code block.
 */
export const toggleCodeBlock = (editor: MirageMDEMethods) => {
	const fenceCharsToInsert = editor.options?.blockStyles?.code;

	const fencing_line = (line: any) => {
		/* return true, if this is a ``` or ~~~ line */
		if (typeof line !== 'object')
			throw 'fencing_line() takes a \'line\' object (not a line number, or line text).  Got: ' + typeof line + ': ' + line;

		return line.styles && line.styles[2] && line.styles[2].indexOf('formatting-code-block') !== -1;
	};

	const token_state = (token: any) => {
		// base goes an extra level deep when mode backdrops are used, e.g. spellchecker on
		return token.state.base.base || token.state.base;
	};

	const code_type = (cm: CodeMirror.Editor, line_num: number, line?: any, firstTok?: any, lastTok?: any) => {
		/*
		 * Return "single", "indented", "fenced" or false
		 *
		 * cm and line_num are required.  Others are optional for efficiency
		 * To check in the middle of a line, pass in firstTok yourself.
		 */
		line ??= cm.getLineHandle(line_num);
		firstTok ??= cm.getTokenAt({
			line: line_num,
			ch:   1,
		});
		lastTok ??= (!!line.text && cm.getTokenAt({
			line: line_num,
			ch:   line.text.length - 1,
		}));

		const types = firstTok.type ? firstTok.type.split(' ') : [];

		if (lastTok && token_state(lastTok).indentedCode) {
			// have to check last char, since first chars of first line aren"t marked as indented
			return 'indented';
		}
		else if (types.indexOf('comment') === -1) {
			// has to be after "indented" check, since first chars of first indented line aren"t marked as such
			return false;
		}
		else if (token_state(firstTok).fencedChars || token_state(lastTok).fencedChars || fencing_line(line)) {
			return 'fenced';
		}
		else {
			return 'single';
		}
	};

	const insertFencingAtSelection = (cm: CodeMirror.Editor, cur_start: any, cur_end: any, fenceCharsToInsert: any) => {
		let start_line_sel = cur_start.line + 1;
		let end_line_sel = cur_end.line + 1;
		let sel_multi = cur_start.line !== cur_end.line;
		let repl_start = fenceCharsToInsert + '\n';
		let repl_end = '\n' + fenceCharsToInsert;
		if (sel_multi)
			end_line_sel++;

		// handle last char including \n or not
		if (sel_multi && cur_end.ch === 0) {
			repl_end = fenceCharsToInsert + '\n';
			end_line_sel--;
		}

		_replaceSelection(cm, false, [ repl_start, repl_end ]);
		cm.setSelection({
			line: start_line_sel,
			ch:   0,
		}, {
			line: end_line_sel,
			ch:   0,
		});
	};

	const cm = editor.codemirror;
	const cur_start = cm.getCursor('start');
	const cur_end = cm.getCursor('end');
	const tok = cm.getTokenAt({
		line: cur_start.line,
		ch:   cur_start.ch || 1,
	}); // avoid ch 0 which is a cursor pos but not token
	let line = cm.getLineHandle(cur_start.line);
	const is_code = code_type(cm, cur_start.line, line, tok);

	let block_start: number | undefined;
	let block_end: number | undefined;
	let lineCount: number;

	if (is_code === 'single') {
		// similar to some EasyMDE _toggleBlock logic
		const start = line.text.slice(0, cur_start.ch).replace('`', ''),
			end = line.text.slice(cur_start.ch).replace('`', '');
		cm.replaceRange(start + end, {
			line: cur_start.line,
			ch:   0,
		}, {
			line: cur_start.line,
			ch:   99999999999999,
		});
		cur_start.ch--;
		if (cur_start !== cur_end)
			cur_end.ch--;

		cm.setSelection(cur_start, cur_end);
		cm.focus();
	}
	else if (is_code === 'fenced') {
		if (cur_start.line !== cur_end.line || cur_start.ch !== cur_end.ch) {
			// use selection

			// find the fenced line so we know what type it is (tilde, backticks, number of them)
			for (block_start = cur_start.line; block_start >= 0; block_start--) {
				line = cm.getLineHandle(block_start);
				if (fencing_line(line))
					break;
			}

			const fencedTok = cm.getTokenAt({
				line: block_start,
				ch:   1,
			});

			const fence_chars = token_state(fencedTok).fencedChars;
			let start_text: string;
			let start_line: number;
			let end_text: string;
			let end_line: number;

			// check for selection going up against fenced lines, in which case we don't want to add more fencing
			if (fencing_line(cm.getLineHandle(cur_start.line))) {
				start_text = '';
				start_line = cur_start.line;
			}
			else if (fencing_line(cm.getLineHandle(cur_start.line - 1))) {
				start_text = '';
				start_line = cur_start.line - 1;
			}
			else {
				start_text = fence_chars + '\n';
				start_line = cur_start.line;
			}

			if (fencing_line(cm.getLineHandle(cur_end.line))) {
				end_text = '';
				end_line = cur_end.line;
				if (cur_end.ch === 0)
					end_line += 1;
			}
			else if (cur_end.ch !== 0 && fencing_line(cm.getLineHandle(cur_end.line + 1))) {
				end_text = '';
				end_line = cur_end.line + 1;
			}
			else {
				end_text = fence_chars + '\n';
				end_line = cur_end.line + 1;
			}

			if (cur_end.ch === 0) {
				// full last line selected, putting cursor at beginning of next
				end_line -= 1;
			}

			cm.operation(() => {
				// end line first, so that line numbers don't change
				cm.replaceRange(end_text, {
					line: end_line,
					ch:   0,
				}, {
					line: end_line + (end_text ? 0 : 1),
					ch:   0,
				});

				cm.replaceRange(start_text, {
					line: start_line,
					ch:   0,
				}, {
					line: start_line + (start_text ? 0 : 1),
					ch:   0,
				});
			});

			cm.setSelection({
				line: start_line + (start_text ? 1 : 0),
				ch:   0,
			}, {
				line: end_line + (start_text ? 1 : -1),
				ch:   0,
			});

			cm.focus();
		}
		else {
			// no selection, search for ends of this fenced block
			let search_from = cur_start.line;
			if (fencing_line(cm.getLineHandle(cur_start.line))) { // gets a little tricky if cursor is right on a fenced line
				if (code_type(cm, cur_start.line + 1) === 'fenced') {
					block_start = cur_start.line;
					search_from = cur_start.line + 1; // for searching for "end"
				}
				else {
					block_end = cur_start.line;
					search_from = cur_start.line - 1; // for searching for "start"
				}
			}
			if (block_start === undefined) {
				for (block_start = search_from; block_start >= 0; block_start--) {
					line = cm.getLineHandle(block_start);
					if (fencing_line(line))
						break;
				}
			}
			if (block_end === undefined) {
				lineCount = cm.lineCount();
				for (block_end = search_from; block_end < lineCount; block_end++) {
					line = cm.getLineHandle(block_end);
					if (fencing_line(line))
						break;
				}
			}

			cm.operation(() => {
				cm.replaceRange('', {
					line: block_start!,
					ch:   0,
				}, {
					line: block_start! + 1,
					ch:   0,
				});
				cm.replaceRange('', {
					line: block_end! - 1,
					ch:   0,
				}, {
					line: block_end!,
					ch:   0,
				});
			});
			cm.focus();
		}
	}
	else if (is_code === 'indented') {
		if (cur_start.line !== cur_end.line || cur_start.ch !== cur_end.ch) {
			// use selection
			block_start = cur_start.line;
			block_end = cur_end.line;
			if (cur_end.ch === 0)
				block_end--;
		}
		else {
			// no selection, search for ends of this indented block
			for (block_start = cur_start.line; block_start >= 0; block_start--) {
				line = cm.getLineHandle(block_start);
				if (line.text.match(/^\s*$/)) {
					// empty or all whitespace - keep going
					continue;
				}
				else {
					if (code_type(cm, block_start, line) !== 'indented') {
						block_start += 1;
						break;
					}
				}
			}
			lineCount = cm.lineCount();
			for (block_end = cur_start.line; block_end < lineCount; block_end++) {
				line = cm.getLineHandle(block_end);
				if (line.text.match(/^\s*$/)) {
					// empty or all whitespace - keep going
					continue;
				}
				else {
					if (code_type(cm, block_end, line) !== 'indented') {
						block_end -= 1;
						break;
					}
				}
			}
		}

		// if we are going to un-indent based on a selected set of lines, and the next line is indented too, we need to
		// insert a blank line so that the next line(s) continue to be indented code
		const next_line = cm.getLineHandle(block_end + 1);
		const next_line_last_tok = next_line && cm.getTokenAt({
			line: block_end + 1,
			ch:   next_line.text.length - 1,
		});
		const next_line_indented = next_line_last_tok && token_state(next_line_last_tok).indentedCode;

		if (next_line_indented) {
			cm.replaceRange('\n', {
				line: block_end + 1,
				ch:   0,
			});
		}

		for (let i = block_start; i <= block_end; i++)
			cm.indentLine(i, 'subtract'); // TODO: this doesn't get tracked in the history, so can't be undone :(

		cm.focus();
	}
	else {
		// insert code formatting
		const no_sel_and_starting_of_line = (cur_start.line === cur_end.line && cur_start.ch === cur_end.ch && cur_start.ch === 0);
		const sel_multi = cur_start.line !== cur_end.line;
		if (no_sel_and_starting_of_line || sel_multi)
			insertFencingAtSelection(cm, cur_start, cur_end, fenceCharsToInsert);
		else
			_replaceSelection(cm, false, [ '`', '`' ]);
	}
};


/**
 * Action for toggling blockquote.
 */
export const toggleBlockquote = (editor: MirageMDEMethods) => {
	_toggleLine(editor.codemirror, 'quote', '');
};


/**
 * Action for toggling heading size: normal -> h1 -> h2 -> h3 -> h4 -> h5 -> h6 -> normal
 */
export const toggleHeadingSmaller = (editor: MirageMDEMethods) => {
	_toggleHeading(editor.codemirror, 'smaller');
};


/**
 * Action for toggling heading size: normal -> h6 -> h5 -> h4 -> h3 -> h2 -> h1 -> normal
 */
export const toggleHeadingBigger = (editor: MirageMDEMethods) => {
	_toggleHeading(editor.codemirror, 'bigger');
};


/**
 * Action for toggling heading size 1
 */
export const toggleHeading1 = (editor: MirageMDEMethods) => {
	_toggleHeading(editor.codemirror, undefined, 1);
};


/**
 * Action for toggling heading size 2
 */
export const toggleHeading2 = (editor: MirageMDEMethods) => {
	_toggleHeading(editor.codemirror, undefined, 2);
};


/**
 * Action for toggling heading size 3
 */
export const toggleHeading3 = (editor: MirageMDEMethods) => {
	_toggleHeading(editor.codemirror, undefined, 3);
};


/**
 * Action for toggling heading size 4
 */
export const toggleHeading4 = (editor: MirageMDEMethods) => {
	_toggleHeading(editor.codemirror, undefined, 4);
};


/**
 * Action for toggling heading size 5
 */
export const toggleHeading5 = (editor: MirageMDEMethods) => {
	_toggleHeading(editor.codemirror, undefined, 5);
};


/**
 * Action for toggling heading size 6
 */
export const toggleHeading6 = (editor: MirageMDEMethods) => {
	_toggleHeading(editor.codemirror, undefined, 6);
};


/**
 * Action for toggling ul.
 */
export const toggleUnorderedList = (editor: MirageMDEMethods) => {
	const cm = editor.codemirror;

	let listStyle = '*'; // Default
	if ([ '-', '+', '*' ].includes(editor.options?.unorderedListStyle ?? ''))
		listStyle = editor.options.unorderedListStyle!;

	_toggleLine(cm, 'unordered-list', listStyle);
};


/**
 * Action for toggling ol.
 */
export const toggleOrderedList = (editor: MirageMDEMethods) => {
	_toggleLine(editor.codemirror, 'ordered-list', '');
};


/**
 * Action for clean block (remove headline, list, blockquote code, markers)
 */
export const cleanBlock = (editor: MirageMDEMethods) => {
	_cleanBlock(editor.codemirror);
};


/**
 * Action for drawing a link.
 */
export const drawLink = (editor: MirageMDEMethods) => {
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


/**
 * Action for drawing an img.
 */
export const drawImage = (editor: MirageMDEMethods) => {
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


/**
 * Encode and escape URLs to prevent breaking up rendered Markdown links.
 */
export const escapePromptURL = (url: string) => {
	return encodeURI(url).replace(/([\\()])/g, '\\$1');
};


/**
 * Action for opening the browse-file window to upload an image to a server.
 */
export const drawUploadedImage = (editor: MirageMDEMethods) => {
	// TODO: Draw the image template with a fake url? ie: '![](importing foo.png...)'
	editor.openBrowseFileWindow();
};


/**
 * Action executed after an image have been successfully imported on the server.
 */
export const afterImageUploaded = (editor: MirageMDEMethods, url: string) => {
	const cm = editor.codemirror;
	const stat = getState(cm);
	const options = editor.options;
	const imageName = url.substr(url.lastIndexOf('/') + 1);
	const ext = imageName.substring(imageName.lastIndexOf('.') + 1).replace(/\?.*$/, '').toLowerCase();

	// Check if media is an image
	if ([ 'png', 'jpg', 'jpeg', 'gif', 'svg', 'apng', 'avif', 'webp' ].includes(ext)) {
		_replaceSelection(cm, !!stat.image, options.insertTexts?.uploadedImage as any, url);
	}
	else {
		const text_link = (options.insertTexts?.link ?? [ '', '' ]) as [string, string];
		text_link[0] = '[' + imageName;
		_replaceSelection(cm, !!stat.link, text_link, url);
	}

	// show uploaded image filename for 1000ms
	editor.updateStatusBar('upload-image', editor.options.imageTexts?.sbOnUploaded?.replace('#image_name#', imageName) ?? '');
	setTimeout(() => {
		editor.updateStatusBar('upload-image', editor.options.imageTexts?.sbInit ?? '');
	}, 1000);
};


/**
 * Action for drawing a table.
 */
export const drawTable = (editor: MirageMDEMethods) => {
	const cm = editor.codemirror;
	const stat = getState(cm);
	const options = editor.options;
	_replaceSelection(cm, !!stat.table, options.insertTexts!.table!);
};


/**
 * Action for drawing a horizontal rule.
 */
export const drawHorizontalRule = (editor: MirageMDEMethods) => {
	const cm = editor.codemirror;
	const stat = getState(cm);
	const options = editor.options;
	_replaceSelection(cm, !!stat.image, options.insertTexts!.horizontalRule!);
};


/**
 * Undo action.
 */
export const undo = (editor: MirageMDEMethods) => {
	const cm = editor.codemirror;
	cm.undo();
	cm.focus();
};


/**
 * Redo action.
 */
export const redo = (editor: MirageMDEMethods) => {
	const cm = editor.codemirror;
	cm.redo();
	cm.focus();
};


/**
 * Toggle side by side preview
 */
export const toggleSideBySide = (editor: MirageMDEMethods) => {
	const cm = editor.codemirror;
	const wrapper = cm.getWrapperElement();
	let preview = wrapper.nextElementSibling as HTMLElement | null;
	const toolbarButton = editor.toolbarElements && editor.toolbarElements['side-by-side'];
	let useSideBySideListener = false;

	const mdeContainer = wrapper.parentElement as HTMLElement | null;

	if (preview?.classList.contains('editor-preview-active-side')) {
		if (editor.options.sideBySideFullscreen === false) {
			// if side-by-side not-fullscreen ok, remove classes when hiding side
			mdeContainer?.classList.remove('sided--no-fullscreen');
		}

		preview.classList.remove('editor-preview-active-side');
		if (toolbarButton)
			toolbarButton.classList.remove('active');

		wrapper.classList.remove('CodeMirror-sided');
	}
	else {
		// When the preview button is clicked for the first time,
		// give some time for the transition from editor.css to fire and the view to slide from right to left,
		// instead of just appearing.
		setTimeout(() => {
			if (!cm.getOption('fullScreen')) {
				if (editor.options.sideBySideFullscreen === false) {
					// if side-by-side not-fullscreen ok, add classes when not fullscreen and showing side
					mdeContainer?.classList.add('sided--no-fullscreen');
				}
				else {
					toggleFullScreen(editor);
				}
			}

			preview?.classList.add('editor-preview-active-side');
		}, 1);
		if (toolbarButton)
			toolbarButton.classList.add('active');

		wrapper.classList.add('CodeMirror-sided');
		useSideBySideListener = true;
	}

	// Hide normal preview if active
	const previewNormal = wrapper.lastElementChild as HTMLElement | null;
	if (previewNormal?.classList.contains('editor-preview-active')) {
		previewNormal.classList.remove('editor-preview-active');
		const toolbar = editor.toolbarElements['preview'];
		const toolbar_div = editor.toolbar_div;
		toolbar?.classList.remove('active');
		toolbar_div.classList.remove('disabled-for-preview');
	}

	const sideBySideRenderingFunction = () => {
		if (!preview)
			return;

		const newValue = editor.options.previewRender?.(editor.value() as string, preview);
		if (newValue != null)
			preview.innerHTML = newValue;
	};

	if (!(cm as any).sideBySideRenderingFunction)
		(cm as any).sideBySideRenderingFunction = sideBySideRenderingFunction;

	if (useSideBySideListener && preview) {
		const newValue = editor.options.previewRender?.(editor.value() as string, preview);
		if (newValue != null)
			preview.innerHTML = newValue;

		cm.on('update', (cm as any).sideBySideRenderingFunction);
	}
	else {
		cm.off('update', (cm as any).sideBySideRenderingFunction);
	}

	// Refresh to fix selection being off (#309)
	cm.refresh();
};


/**
 * Preview action.
 */
export const togglePreview = (editor: MirageMDEMethods) => {
	const cm = editor.codemirror;
	const wrapper = cm.getWrapperElement();
	const toolbar_div = editor.toolbar_div;
	const toolbar = editor.options.toolbar ? editor.toolbarElements['preview'] : false;
	let preview = wrapper.lastElementChild as HTMLElement | null;

	// Turn off side by side if needed
	const sidebyside = cm.getWrapperElement().nextElementSibling as HTMLElement | null;
	if (sidebyside?.classList.contains('editor-preview-active-side'))
		toggleSideBySide(editor);

	if (!preview || !preview.classList.contains('editor-preview-full')) {
		preview = document.createElement('div');
		preview.className = 'editor-preview-full';

		if (editor.options.previewClass) {
			if (Array.isArray(editor.options.previewClass)) {
				for (let i = 0; i < editor.options.previewClass.length; i++)
					preview.classList.add(editor.options.previewClass[i]);
			}
			else if (typeof editor.options.previewClass === 'string') {
				preview.classList.add(editor.options.previewClass);
			}
		}

		wrapper.appendChild(preview);
	}

	if (preview.classList.contains('editor-preview-active')) {
		preview.classList.remove('editor-preview-active');
		if (toolbar) {
			toolbar.classList.remove('active');
			toolbar_div.classList.remove('disabled-for-preview');
		}
	}
	else {
		// When the preview button is clicked for the first time,
		// give some time for the transition from editor.css to fire and the view to slide from right to left,
		// instead of just appearing.
		setTimeout(() => {
			preview?.classList.add('editor-preview-active');
		}, 1);
		if (toolbar) {
			toolbar.classList.add('active');
			toolbar_div.classList.add('disabled-for-preview');
		}
	}

	const preview_result = editor.options.previewRender?.(editor.value() as string, preview);
	preview.innerHTML = preview_result ?? '';
};


/**
 * Convert a number of bytes to a human-readable file size. If you desire
 * to add a space between the value and the unit, you need to add this space
 * to the given units.
 * @returns string A human-readable file size. Ex: '412 KB'
 */
export const humanFileSize = (
	/** A number of bytes, as integer. Ex: 421137 */
	bytes: number,
	/** An array of human-readable units, ie. [' B', ' K', ' MB'] */
	units: (number | string)[],
) => {
	if (Math.abs(bytes) < 1024)
		return '' + bytes + Number(units[0]);

	let u = 0;
	do {
		bytes /= 1024;
		++u;
	} while (Math.abs(bytes) >= 1024 && u < units.length);

	return '' + bytes.toFixed(1) + units[u];
};


// Merge an arbitrary number of objects into one.
export const extend = <T extends object>(...objects: Record<keyof any, any>[]): T => {
	let target: T = objects[0]!;

	for (let i = 1; i < objects.length; i++)
		target = _mergeProperties(target, objects[i]!);

	return target;
};

/* The right word count in respect for CJK. */
export const wordCount = (data: string) => {
	const pattern = /[a-zA-Z0-9_\u00A0-\u02AF\u0392-\u03c9\u0410-\u04F9]+|[\u4E00-\u9FFF\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]+/g;
	const m = data.match(pattern);
	let count = 0;
	if (m === null)
		return count;

	for (let i = 0; i < m.length; i++) {
		if (m[i]!.charCodeAt(0) >= 0x4E00)
			count += m[i]!.length;
		else
			count += 1;
	}

	return count;
};


const _iconClassMap = {
	'bold':            'fa fa-bold',
	'italic':          'fa fa-italic',
	'strikethrough':   'fa fa-strikethrough',
	'heading':         'fa fa-header fa-heading',
	'heading-smaller': 'fa fa-header fa-heading header-smaller',
	'heading-bigger':  'fa fa-header fa-heading header-bigger',
	'heading-1':       'fa fa-header fa-heading header-1',
	'heading-2':       'fa fa-header fa-heading header-2',
	'heading-3':       'fa fa-header fa-heading header-3',
	'code':            'fa fa-code',
	'quote':           'fa fa-quote-left',
	'ordered-list':    'fa fa-list-ol',
	'unordered-list':  'fa fa-list-ul',
	'clean-block':     'fa fa-eraser',
	'link':            'fa fa-link',
	'image':           'fa fa-image',
	'upload-image':    'fa fa-image',
	'table':           'fa fa-table',
	'horizontal-rule': 'fa fa-minus',
	'preview':         'fa fa-eye',
	'side-by-side':    'fa fa-columns',
	'fullscreen':      'fa fa-arrows-alt',
	'guide':           'fa fa-question-circle',
	'undo':            'fa fa-undo',
	'redo':            'fa fa-repeat fa-redo',
};
export const iconClassMap: RecordOf<typeof _iconClassMap, string, string> = _iconClassMap;
export type IconClassMap = typeof _iconClassMap;


const _toolbarBuiltInButtons: Record<string, ToolbarItem> = {
	'bold': {
		name:      'bold',
		action:    toggleBold,
		className: iconClassMap['bold'],
		title:     'Bold',
		default:   true,
	},
	'italic': {
		name:      'italic',
		action:    toggleItalic,
		className: iconClassMap['italic'],
		title:     'Italic',
		default:   true,
	},
	'strikethrough': {
		name:      'strikethrough',
		action:    toggleStrikethrough,
		className: iconClassMap['strikethrough'],
		title:     'Strikethrough',
	},
	'heading': {
		name:      'heading',
		action:    toggleHeadingSmaller,
		className: iconClassMap['heading'],
		title:     'Heading',
		default:   true,
	},
	'heading-smaller': {
		name:      'heading-smaller',
		action:    toggleHeadingSmaller,
		className: iconClassMap['heading-smaller'],
		title:     'Smaller Heading',
	},
	'heading-bigger': {
		name:      'heading-bigger',
		action:    toggleHeadingBigger,
		className: iconClassMap['heading-bigger'],
		title:     'Bigger Heading',
	},
	'heading-1': {
		name:      'heading-1',
		action:    toggleHeading1,
		className: iconClassMap['heading-1'],
		title:     'Big Heading',
	},
	'heading-2': {
		name:      'heading-2',
		action:    toggleHeading2,
		className: iconClassMap['heading-2'],
		title:     'Medium Heading',
	},
	'heading-3': {
		name:      'heading-3',
		action:    toggleHeading3,
		className: iconClassMap['heading-3'],
		title:     'Small Heading',
	},
	'separator-1': {
		name: 'separator-1',
	},
	'code': {
		name:      'code',
		action:    toggleCodeBlock,
		className: iconClassMap['code'],
		title:     'Code',
	},
	'quote': {
		name:      'quote',
		action:    toggleBlockquote,
		className: iconClassMap['quote'],
		title:     'Quote',
		default:   true,
	},
	'unordered-list': {
		name:      'unordered-list',
		action:    toggleUnorderedList,
		className: iconClassMap['unordered-list'],
		title:     'Generic List',
		default:   true,
	},
	'ordered-list': {
		name:      'ordered-list',
		action:    toggleOrderedList,
		className: iconClassMap['ordered-list'],
		title:     'Numbered List',
		default:   true,
	},
	'clean-block': {
		name:      'clean-block',
		action:    cleanBlock,
		className: iconClassMap['clean-block'],
		title:     'Clean block',
	},
	'separator-2': {
		name: 'separator-2',
	},
	'link': {
		name:      'link',
		action:    drawLink,
		className: iconClassMap['link'],
		title:     'Create Link',
		default:   true,
	},
	'image': {
		name:      'image',
		action:    drawImage,
		className: iconClassMap['image'],
		title:     'Insert Image',
		default:   true,
	},
	'upload-image': {
		name:      'upload-image',
		action:    drawUploadedImage,
		className: iconClassMap['upload-image'],
		title:     'Import an image',
	},
	'table': {
		name:      'table',
		action:    drawTable,
		className: iconClassMap['table'],
		title:     'Insert Table',
	},
	'horizontal-rule': {
		name:      'horizontal-rule',
		action:    drawHorizontalRule,
		className: iconClassMap['horizontal-rule'],
		title:     'Insert Horizontal Line',
	},
	'separator-3': {
		name: 'separator-3',
	},
	'preview': {
		name:      'preview',
		action:    togglePreview,
		className: iconClassMap['preview'],
		noDisable: true,
		title:     'Toggle Preview',
		default:   true,
	},
	'side-by-side': {
		name:      'side-by-side',
		action:    toggleSideBySide,
		className: iconClassMap['side-by-side'],
		noDisable: true,
		noMobile:  true,
		title:     'Toggle Side by Side',
		default:   true,
	},
	'fullscreen': {
		name:      'fullscreen',
		action:    toggleFullScreen,
		className: iconClassMap['fullscreen'],
		noDisable: true,
		noMobile:  true,
		title:     'Toggle Fullscreen',
		default:   true,
	},
	'separator-4': {
		name: 'separator-4',
	},
	'guide': {
		name:      'guide',
		action:    'https://www.markdownguide.org/basic-syntax/',
		className: iconClassMap['guide'],
		noDisable: true,
		title:     'Markdown Guide',
		default:   true,
	},
	'separator-5': {
		name: 'separator-5',
	},
	'undo': {
		name:      'undo',
		action:    undo,
		className: iconClassMap['undo'],
		noDisable: true,
		title:     'Undo',
	},
	'redo': {
		name:      'redo',
		action:    redo,
		className: iconClassMap['redo'],
		noDisable: true,
		title:     'Redo',
	},
};
export const toolbarBuiltInButtons: RecordOf<typeof _toolbarBuiltInButtons, string, ToolbarItem> = _toolbarBuiltInButtons;
export type ToolbarBuiltInButtons = typeof _toolbarBuiltInButtons;


const _insertTexts = {
	link:           [ '[', '](#url#)' ],
	image:          [ '![', '](#url#)' ],
	uploadedImage:  [ '![](#url#)', '' ],
	// uploadedImage: ['![](#url#)\n', ''], // TODO: New line insertion doesn't work here.
	table:          [ '', '\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |\n\n' ],
	horizontalRule: [ '', '\n\n-----\n\n' ],
};
export const insertTexts: RecordOf<typeof _insertTexts, string, string[]> = _insertTexts;


const _promptTexts = {
	link:  'URL for the link:',
	image: 'URL of the image:',
};
export const promptTexts: RecordOf<typeof _promptTexts, string, string> = _promptTexts;


const _timeFormat = {
	locale: 'en-US',
	format: {
		hour:   '2-digit',
		minute: '2-digit',
	},
};
export const timeFormat: RecordOf<
	typeof _timeFormat,
	string,
	string | {hour: string; minute: string}
> = _timeFormat;


const _blockStyles = {
	'bold':   '**',
	'code':   '```',
	'italic': '*',
};
export const blockStyles: RecordOf<typeof _blockStyles, string, string> = _blockStyles;


/**
 * Texts displayed to the user (mainly on the status bar) for the import image
 * feature. Can be used for customization or internationalization.
 */
const _imageTexts = {
	sbInit:        'Attach files by drag and dropping or pasting from clipboard.',
	sbOnDragEnter: 'Drop image to upload it.',
	sbOnDrop:      'Uploading image #images_names#...',
	sbProgress:    'Uploading #file_name#: #progress#%',
	sbOnUploaded:  'Uploaded #image_name#',
	sizeUnits:     ' B, KB, MB',
};
export const imageTexts: RecordOf<typeof _imageTexts, string, string> = _imageTexts;


/**
 * Errors displayed to the user, using the `errorCallback` option. Can be used for
 * customization or internationalization.
 */
const _errorMessages = {
	noFileGiven:    'You must select a file.',
	typeNotAllowed: 'This image type is not allowed.',
	ficonstooLarge: 'Image #image_name# is too big (#image_size#).\n' +
        'Maximum file size is #image_max_size#.',
	importError: 'Something went wrong when uploading the image #image_name#.',
};
export const errorMessages: RecordOf<typeof _errorMessages, string, string> = _errorMessages;


const _shortcuts = {
	'toggleBold':           'Cmd-B',
	'toggleItalic':         'Cmd-I',
	'drawLink':             'Cmd-K',
	'toggleHeadingSmaller': 'Cmd-H',
	'toggleHeadingBigger':  'Shift-Cmd-H',
	'toggleHeading1':       'Ctrl+Alt+1',
	'toggleHeading2':       'Ctrl+Alt+2',
	'toggleHeading3':       'Ctrl+Alt+3',
	'toggleHeading4':       'Ctrl+Alt+4',
	'toggleHeading5':       'Ctrl+Alt+5',
	'toggleHeading6':       'Ctrl+Alt+6',
	'cleanBlock':           'Cmd-E',
	'drawImage':            'Cmd-Alt-I',
	'toggleBlockquote':     'Cmd-\'',
	'toggleOrderedList':    'Cmd-Alt-L',
	'toggleUnorderedList':  'Cmd-L',
	'toggleCodeBlock':      'Cmd-Alt-C',
	'togglePreview':        'Cmd-P',
	'toggleSideBySide':     'F9',
	'toggleFullScreen':     'F11',
};
export const shortcuts: RecordOf<typeof _shortcuts, string, string> = _shortcuts;
export type Shortcuts = typeof shortcuts;


// Mapping of actions that can be bound to keyboard shortcuts or toolbar buttons
const _bindings = {
	'toggleBold':           toggleBold,
	'toggleItalic':         toggleItalic,
	'drawLink':             drawLink,
	'toggleHeadingSmaller': toggleHeadingSmaller,
	'toggleHeadingBigger':  toggleHeadingBigger,
	'drawImage':            drawImage,
	'toggleBlockquote':     toggleBlockquote,
	'toggleOrderedList':    toggleOrderedList,
	'toggleUnorderedList':  toggleUnorderedList,
	'toggleCodeBlock':      toggleCodeBlock,
	'togglePreview':        togglePreview,
	'toggleStrikethrough':  toggleStrikethrough,
	'toggleHeading1':       toggleHeading1,
	'toggleHeading2':       toggleHeading2,
	'toggleHeading3':       toggleHeading3,
	'toggleHeading4':       toggleHeading4,
	'toggleHeading5':       toggleHeading5,
	'toggleHeading6':       toggleHeading6,
	'cleanBlock':           cleanBlock,
	'drawTable':            drawTable,
	'drawHorizontalRule':   drawHorizontalRule,
	'undo':                 undo,
	'redo':                 redo,
	'toggleSideBySide':     toggleSideBySide,
	'toggleFullScreen':     toggleFullScreen,
};
export const bindings: RecordOf<typeof _bindings, string, (editor: MirageMDEMethods) => void> = _bindings;
