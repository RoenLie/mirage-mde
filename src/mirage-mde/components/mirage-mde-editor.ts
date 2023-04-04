import { EditorView, keymap } from '@codemirror/view';
import { css, html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { testDoc } from '../../doc-example.js';
import { editorToPreview, handleEditorScroll } from '../actions/toggle-sidebyside.js';
import { CodeMirrorSetup } from '../codemirror/codemirror-setup.js';
import { toggleItalic } from '../codemirror/commands/toggle-italic.js';
import { MirageMDE } from '../mirage-mde.js';
import styles from './mirage-mde-editor.scss?inline';


const MMDEimageCache = new Map<string, any>();


@customElement('mirage-mde-editor')
export class EditorElement extends LitElement {

	@property({ type: Object }) public scope: MirageMDE;
	protected documentOnKeyDown: (ev: KeyboardEvent) => any;

	public override disconnectedCallback() {
		super.disconnectedCallback();
		globalThis.removeEventListener('keydown', this.documentOnKeyDown);
	}

	public create() {
		this.scope.editor = new EditorView({
			doc:        testDoc,
			extensions: [
				keymap.of([ { key: 'c-i', run: toggleItalic } ]),

				EditorView.domEventHandlers({
					scroll: (ev) => handleEditorScroll(ev, this.scope),
				}),
				EditorView.updateListener.of((update) => {
					if (this.scope.options.host?.classList.contains('sidebyside')) {
						if (update.docChanged)
							editorToPreview(this.scope);
					}
				}),

				// setup is added after, as codemirror has a first come first priority system.
				// atleast for keybindings.
				...CodeMirrorSetup,
			],
			parent: this.renderRoot,
		});

		// Do an initial conversion of the markdown to speed up opening the preview.
		editorToPreview(this.scope);
	}


	//public create() {
	//	const scope = this.scope;
	//	const options = scope.options;

	//	scope.gui.editor = this;
	//	scope.element = this.renderRoot.querySelector('textarea')!;

	//	let mode: string | CodeMirror.ModeSpec<CodeMirror.ModeSpecOptions> | undefined;
	//	let backdrop;

	//	// CodeMirror overlay mode
	//	if (options.overlayMode) {
	//		CodeMirror.defineMode('overlay-mode', (config) => {
	//			const baseMode = CodeMirror.getMode(config, options.spellChecker !== false ? 'spell-checker' : 'gfm');
	//			const overlayMode = options.overlayMode?.mode;
	//			const combineMode = options.overlayMode?.combine;

	//			if (!(baseMode && overlayMode && combineMode))
	//				throw ('MirageMDE: could not defined modes');

	//			return CodeMirror.overlayMode(baseMode, overlayMode, combineMode);
	//		});

	//		mode = 'overlay-mode';
	//		backdrop = options.parsingConfig!;
	//		backdrop.gitHubSpice = false;
	//	}
	//	else {
	//		mode = options.parsingConfig! as CodeMirror.ModeSpec<CodeMirror.ModeSpecOptions>;
	//		mode.name = 'gfm';
	//		mode.gitHubSpice = false;
	//	}

	//	if (options.spellChecker !== false) {
	//		mode = 'spell-checker';
	//		backdrop = options.parsingConfig!;
	//		backdrop.name = 'gfm';
	//		backdrop.gitHubSpice = false;

	//		if (typeof options.spellChecker === 'function') {
	//			options.spellChecker({
	//				codeMirrorInstance: CodeMirror,
	//			});
	//		}
	//		else {
	//			CodeMirrorSpellChecker({
	//				codeMirrorInstance: CodeMirror,
	//			});
	//		}
	//	}

	//	scope.codemirror = CodeMirror.fromTextArea(scope.element, {
	//		theme:              (options.theme != undefined)       ? options.theme   : 'MirageMDE',
	//		tabSize:            (options.tabSize != undefined)     ? options.tabSize : 2,
	//		indentUnit:         (options.tabSize != undefined)     ? options.tabSize : 2,
	//		indentWithTabs:     (options.indentWithTabs === false) ? false           : true,
	//		lineNumbers:        (options.lineNumbers === true)     ? true            : false,
	//		autofocus:          (options.autofocus === true)       ? true            : false,
	//		lineWrapping:       !(options.lineWrapping === false),
	//		styleSelectedText:  (options.styleSelectedText != undefined) ? options.styleSelectedText : !isMobile(),
	//		scrollbarStyle:     (options.scrollbarStyle != undefined)    ? options.scrollbarStyle    : 'native',
	//		inputStyle:         (options.inputStyle != undefined)        ? options.inputStyle        : isMobile() ? 'contenteditable' : 'textarea',
	//		spellcheck:         (options.nativeSpellcheck != undefined)  ? options.nativeSpellcheck  : true,
	//		autoRefresh:        (options.autoRefresh != undefined)       ? options.autoRefresh       : false,
	//		mode:               mode,
	//		extraKeys:          this.setupKeyboardHandling(),
	//		direction:          options.direction,
	//		allowDropFileTypes: [ 'text/plain' ],
	//		placeholder:        options.placeholder ?? scope.element.getAttribute('placeholder') ?? '',
	//		configureMouse:     () => ({ addNew: false }),
	//		backdrop:           backdrop, // This does not actually belong in this type, for some reason.
	//	} as CodeMirror.EditorConfiguration);

	//	if (options.autosave?.enabled) {
	//		scope.autosave(); // use to load localstorage content
	//		scope.codemirror.on('change', () => {
	//			clearTimeout(scope.autosaveTimeoutId);
	//			scope.autosaveTimeoutId = setTimeout(
	//				() => scope.autosave(),
	//				scope.options?.autosave?.submit_delay || scope.options?.autosave?.delay || 1000,
	//			);
	//		});
	//	}

	//	if (options.initialValue && scope.options.autosave?.foundSavedValue !== true)
	//		scope.value(options.initialValue);

	//	if (options.previewImagesInEditor)
	//		this.setupImagePreviewHandling();

	//	if (options.uploadImage)
	//		this.setupImageUploadHandling();

	//	if (options.autofocus === true || scope.element.autofocus)
	//		scope.codemirror.focus();

	//	// Fixes CodeMirror bug (#344)
	//	setTimeout(() => scope.codemirror.refresh());
	//}

	//protected setupKeyboardHandling() {
	//	const scope = this.scope;

	//	const keyMaps: CodeMirror.KeyMap = {};
	//	actionRegister.forEach((item) => {
	//		if (item.type !== 'button' || !item.shortcut)
	//			return;

	//		const shortcut = fixShortcut(item.shortcut);
	//		keyMaps[shortcut] = () => {
	//			if (typeof item.action === 'function')
	//				item.action(scope);
	//			if (typeof item.action === 'string')
	//				globalThis.open(item.action, '_blank');
	//		};
	//	});

	//	// Library markdown functions.
	//	keyMaps['Enter'] = 'newlineAndIndentContinueMarkdownList';
	//	keyMaps['Tab'] = 'tabAndIndentMarkdownList';
	//	keyMaps['Shift-Tab'] = 'shiftTabAndUnindentMarkdownList';

	//	globalThis.removeEventListener('keydown', this.documentOnKeyDown);
	//	this.documentOnKeyDown = (ev: KeyboardEvent) => {
	//		if (ev.code === 'Escape' && scope.codemirror.getOption('fullScreen'))
	//			toggleFullScreen(scope);
	//	};
	//	globalThis.addEventListener('keydown', this.documentOnKeyDown);


	//	return keyMaps;
	//}

	//protected setupImagePreviewHandling() {
	//	const scope = this.scope;
	//	const options = scope.options;

	//	const calcHeight = (naturalWidth: number, naturalHeight: number) => {
	//		const viewportWidth = parseInt(
	//			window.getComputedStyle(this.renderRoot.querySelector('.CodeMirror-sizer')!)
	//				.width.replace('px', ''),
	//		);

	//		let height;
	//		if (naturalWidth < viewportWidth)
	//			height = naturalHeight + 'px';
	//		else
	//			height = (naturalHeight / naturalWidth * 100) + '%';

	//		return height;
	//	};

	//	const assignImageBlockAttributes = (
	//		parentEl: HTMLElement,
	//		img: {
	//			url: string;
	//			naturalWidth: number;
	//			naturalHeight: number;
	//		},
	//	) => {
	//		parentEl.setAttribute('data-img-src', img.url);

	//		const style = Object.entries({
	//			'--width':    `${ img.naturalWidth }px`,
	//			'--height':   calcHeight(img.naturalWidth, img.naturalHeight),
	//			'--bg-image': `url('${ img.url }')`,
	//		}).reduce((prev, [ key, value ]) => (prev += `${ key }:${ value };`), '');

	//		parentEl.setAttribute('style', style);
	//		scope.codemirror.setSize(null, null);
	//	};

	//	const handleImages = () => {
	//		this.renderRoot.querySelectorAll('.cm-image-marker').forEach((el) => {
	//			const parentEl = el.parentElement;
	//			if (!parentEl)
	//				return;

	//			// if img pasted on the same line with other text, don't preview, preview only images on separate line
	//			if (!parentEl.innerText.match(/^!\[.*?\]\(.*\)/g))
	//				return;

	//			if (parentEl.hasAttribute('data-img-src'))
	//				return;

	//			// might require better parsing according to markdown spec
	//			const srcAttr = parentEl.innerText.match('\\((.*)\\)');
	//			if (!srcAttr || srcAttr.length < 2)
	//				return;

	//			let keySrc = srcAttr[1]!;

	//			if (options.imagesPreviewHandler)
	//				keySrc = options.imagesPreviewHandler(keySrc);

	//			if (MMDEimageCache.has(keySrc)) {
	//				assignImageBlockAttributes(parentEl, MMDEimageCache.get(keySrc));
	//			}
	//			else {
	//				const img = document.createElement('img');
	//				img.src = keySrc;
	//				img.onload = () => {
	//					MMDEimageCache.set(keySrc, {
	//						naturalWidth:  img.naturalWidth,
	//						naturalHeight: img.naturalHeight,
	//						url:           keySrc,
	//					});

	//					assignImageBlockAttributes(parentEl, MMDEimageCache.get(keySrc));
	//				};
	//			}
	//		});
	//	};

	//	scope.codemirror.on('update', () => void handleImages());
	//}

	//protected setupImageUploadHandling() {
	//	const scope = this.scope;
	//	const options = scope.options;

	//	scope.codemirror.on('dragenter', (cm, event) => {
	//		scope.updateStatusBar('upload-image', scope.options.imageTexts!.sbOnDragEnter!);
	//		event.stopPropagation();
	//		event.preventDefault();
	//	});
	//	scope.codemirror.on('dragend' as 'dragenter', (cm, event) => {
	//		scope.updateStatusBar('upload-image', scope.options.imageTexts!.sbInit!);
	//		event.stopPropagation();
	//		event.preventDefault();
	//	});
	//	scope.codemirror.on('dragleave', (cm, event) => {
	//		scope.updateStatusBar('upload-image', scope.options.imageTexts!.sbInit!);
	//		event.stopPropagation();
	//		event.preventDefault();
	//	});

	//	scope.codemirror.on('dragover', (cm, event) => {
	//		scope.updateStatusBar('upload-image', scope.options.imageTexts!.sbOnDragEnter!);
	//		event.stopPropagation();
	//		event.preventDefault();
	//	});

	//	scope.codemirror.on('drop', (cm, event) => {
	//		event.stopPropagation();
	//		event.preventDefault();
	//		if (options.imageUploadFunction)
	//			scope.uploadImagesUsingCustomFunction(options.imageUploadFunction, event!.dataTransfer!.files);
	//		else
	//			scope.uploadImages(event.dataTransfer!.files!);
	//	});

	//	scope.codemirror.on('paste', (cm, event) => {
	//		if (options.imageUploadFunction)
	//			scope.uploadImagesUsingCustomFunction(options.imageUploadFunction, event.clipboardData!.files);
	//		else
	//			scope.uploadImages(event.clipboardData!.files);
	//	});
	//}

	protected override render() {
		return html``;
	}

	public static override styles = [
		unsafeCSS(styles),
		css`
		.cm-editor {
			overflow: hidden;
		}
		.cm-scroller::-webkit-scrollbar {
			width: var(--mmde-scrollsize);
			height: var(--mmde-scrollsize);
		}
		.cm-scroller::-webkit-scrollbar-track {
			background: var(--mmde-scrollbg);
		}
		.cm-scroller::-webkit-scrollbar-thumb {
			background: var(--mmde-scrollthumb);
			border-radius: 0px;
			background-clip: padding-box;
		}
		.cm-scroller::-webkit-scrollbar-corner {
			background: var(--mmde-scrollbg);
		}
		:host .cm-scroller {
			font-family: Helvetica;
		}
		:host .cm-gutters {
			background-color: rgb(25, 34, 43);
			border-right: 1px solid rgb(30, 40, 50);
		}
		`,
	];

}


declare global {
	interface HTMLElementTagNameMap {
		'mirage-mde-editor': EditorElement;
	}
}
