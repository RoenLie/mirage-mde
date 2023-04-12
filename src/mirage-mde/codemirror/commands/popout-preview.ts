import { css, CSSResult, CSSResultGroup, CSSResultOrNative, html, LitElement, render, supportsAdoptingStyleSheets, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { MirageMDE } from '../../mirage-mde.js';
import { MMDECommand } from '../../registry/action-registry.js';
import codeDarkStyles from '../../styles/code-dark.scss?inline';
import markdownDarkStyles from '../../styles/markdown-dark.scss?inline';
import markdownLightStyles from '../../styles/markdown-light.scss?inline';
import { editorToPreview } from './toggle-sidebyside.js';


/**
 * Action for opening an external window which holds a live preview of the rendered markdown.
 */
export const popoutPreview: MMDECommand = (view, scope) => {
	if (scope.isWindowActive)
		return false;

	const windowCfg = Object.entries({
		popup:  true,
		width:  1200,
		height: 1200,
		top:    window.outerHeight / 2 + window.screenY - (1200 / 2),
		left:   window.outerWidth / 2 + window.screenX - (1200 / 2),
	}).map(([ key, val ]) => `${ key }=${ val }`).join(',');

	const winHandle = window.open(undefined, 'window-preview', windowCfg);

	const winBodyStyle = document.createElement('style');
	winBodyStyle.innerHTML = `
	body {
		display: grid;
		background-color: black;
		color: white;
		min-height: 100dvh;
		margin: 0;
		padding: 0;
		padding-block: 32px;
	}
	* {
		box-sizing: border-box;
	}
	*::-webkit-scrollbar {
		width: 12px;
		height: 12px;
	}
	*::-webkit-scrollbar-track {
		background: rgb(30,30,30);
	}
	*::-webkit-scrollbar-thumb {
		background: rgb(50,50,50);
		border-radius: 0px;
		background-clip: padding-box;
	}
	*::-webkit-scrollbar-corner {
		background: rgb(30,30,30);
	}
	mirage-mde-window-display {
		display: grid;
	}
	.markdown-body {
		padding: 4px;
		word-break: break-word;
		place-self: start center;

		width: clamp(500px, 70vw, 800px);
		border-radius: 4px;
	}
	`;

	const winDarkMarkdownStyle = document.createElement('style');
	winDarkMarkdownStyle.innerHTML = markdownDarkStyles;

	const winLightMarkdownStyle = document.createElement('style');
	winLightMarkdownStyle.innerHTML = markdownLightStyles;

	const winDarkCodeStyle = document.createElement('style');
	winDarkCodeStyle.innerHTML = codeDarkStyles;

	winHandle?.document.head.appendChild(winBodyStyle);
	//winHandle?.document.head.appendChild(winDarkMarkdownStyle);
	//winHandle?.document.head.appendChild(winLightMarkdownStyle);
	//winHandle?.document.head.appendChild(winDarkCodeStyle);

	render(html`
	<mirage-mde-window
		.scope=${ scope }
	></mirage-mde-window>
	`, winHandle!.document.body);


	//const windowEl = document.createElement('mirage-mde-window');
	//windowEl.scope = scope;
	//windowEl.style.display = 'none';
	//document.body.appendChild(windowEl);
	//winHandle!.document.body.appendChild(windowEl);
	//windowEl.style.display = '';

	const previewButton = scope.toolbarElements['popout']?.value;
	previewButton?.classList.toggle('active', true);

	winHandle?.addEventListener('beforeunload', () => {
		previewButton?.classList.toggle('active', false);
		scope.gui.window = undefined;
	}, {
		once: true,
	});

	return true;
};


@customElement('mirage-mde-window')
export class WindowElement extends LitElement {

	@property({ type: Object }) public scope: MirageMDE;
	@state() protected htmlContent = '';

	public setContent(htmlString: string): void
	public setContent(htmlString: Promise<string>): Promise<string>
	public setContent(htmlString: any): any {
		if (typeof htmlString === 'string')
			this.htmlContent = htmlString;
		else if (htmlString)
			return htmlString.then((s: string) => this.htmlContent = s);
	}

	protected override createRenderRoot() {
		return this;
	}

	//protected adoptedCallback() {
	//	// Adopt the old styles into the new document
	//	adoptStyles(this.shadowRoot!, (this.constructor as typeof LitElement).styles!, this.ownerDocument.defaultView!);
	//}

	public override connectedCallback() {
		super.connectedCallback();

		this.scope.gui.window = this;
		editorToPreview(this.scope);
	}

	protected override render() {
		return html`
		<mirage-mde-window-display
			.content=${ this.htmlContent }
		></mirage-mde-window-display>
		`;
	}

}


@customElement('mirage-mde-window-display')
export class WindowDisplayElement extends LitElement {

	@property() public theme: 'light' | 'dark' = 'dark';
	@property() public content = '';

	//protected override createRenderRoot() {
	//	return this;
	//}


	protected override createRenderRoot() {
		const renderRoot = this.shadowRoot ?? this.attachShadow(
			(this.constructor as any).shadowRootOptions,
		);

		// When adoptedStyleSheets are shimmed, they are inserted into the
		// shadowRoot by createRenderRoot. Adjust the renderBefore node so that
		// any styles in Lit content render before adoptedStyleSheets. This is
		// important so that adoptedStyleSheets have precedence over styles in
		// the shadowRoot.
		this.renderOptions.renderBefore ??= renderRoot!.firstChild as ChildNode;

		adoptStyles(
			renderRoot,
			((this.constructor as typeof LitElement).styles ?? []) as CSSResultOrNative[],
			this.ownerDocument.defaultView!,
		);

		// adoptStyles(
		//   renderRoot,
		//   (this.constructor as typeof ReactiveElement).elementStyles
		// );

		return renderRoot;
	}


	protected adoptedCallback() {
		// Adopt the old styles into the new document
		if (this.shadowRoot) {
			adoptStyles(
				this.shadowRoot,
				((this.constructor as typeof LitElement).styles ?? []) as CSSResultOrNative[],
				this.ownerDocument.defaultView!,
			);
		}
	}

	protected override render() {
		return html`
		<div class=${ classMap({ 'markdown-body': true, [this.theme]: true }) }>
			${ unsafeHTML(this.content) }
		</div>
		`;
	}

	public static override styles = [
		unsafeCSS(markdownDarkStyles),
		unsafeCSS(markdownLightStyles),
		unsafeCSS(codeDarkStyles),
		css`
		:host {
			display: grid;
		}
		.markdown-body {
			padding: 4px;
			word-break: break-word;
			place-self: start center;

			width: clamp(500px, 70vw, 800px);
			border-radius: 4px;
		}
		`,
	];

}


declare global {
	interface HTMLElementTagNameMap {
		'mirage-mde-window': WindowElement;
		'mirage-mde-window-display': WindowDisplayElement;
	}
}


// This function migrates styles from a custom element's constructe stylesheet to a new document.
export function adoptStyles(shadowRoot: ShadowRoot, styles: Array<CSSResultOrNative>, defaultView: Window) {
	// If the browser supports adopting stylesheets
	if (supportsAdoptingStyleSheets) {
		// If the styles is an array of CSSResultGroup Objects
		// This happens when styles is passed an array i.e. => static styles = [css`${styles1}`, css`${styles2}`] in the component
		if ((styles as CSSResultGroup[])?.length) {
			// Define the sheets array by mapping the array of CSSResultGroup objects
			const sheets = (styles as CSSResultGroup[]).map(s => {
				// Create a new stylesheet in the context of the owner document's window
				// We have to cast defaultView as any due to typescript definition not allowing us to call CSSStyleSheet in this conext
				// We have to cast CSSStyleSheet as <any> due to typescript definition not containing replaceSync for CSSStyleSheet
				const sheet = (new (defaultView as any).CSSStyleSheet() as any);

				// Update the new sheet with the old styles
				sheet.replaceSync(s);

				// Return the sheet
				return sheet;
			});

			// Set adoptedStyleSheets with the new styles (must be an array)
			(shadowRoot as any).adoptedStyleSheets = sheets;
		}
		else {
			// Create a new stylesheet in the context of the owner document's window
			// We have to cast defaultView as any due to typescript definition not allowing us to call CSSStyleSheet in this conext
			// We have to cast CSSStyleSheet as <any> due to typescript definition not containing replaceSync for CSSStyleSheet
			const sheet = (new (defaultView as any).CSSStyleSheet() as any);

			// Update the new sheet with the old styles
			sheet.replaceSync(styles);

			// Set adoptedStyleSheets with the new styles (must be an array)
			(shadowRoot as any).adoptedStyleSheets = [ sheet ];
		}
	}
	else {
		styles.forEach((s) => {
			const style = document.createElement('style');
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const nonce = (globalThis as any)['litNonce'];
			if (nonce !== undefined)
				style.setAttribute('nonce', nonce);

			style.textContent = (s as CSSResult).cssText;
			shadowRoot.appendChild(style);
		});
	}
}


/**
 * Applies the given styles to a `shadowRoot`. When Shadow DOM is
 * available but `adoptedStyleSheets` is not, styles are appended to the
 * `shadowRoot` to [mimic spec behavior](https://wicg.github.io/construct-stylesheets/#using-constructed-stylesheets).
 * Note, when shimming is used, any styles that are subsequently placed into
 * the shadowRoot should be placed *before* any shimmed adopted styles. This
 * will match spec behavior that gives adopted sheets precedence over styles in
 * shadowRoot.
 */
//export const adoptStyles = (
//	renderRoot: ShadowRoot,
//	styles: Array<CSSResultOrNative>,
//) => {
//	if (supportsAdoptingStyleSheets) {
//	  (renderRoot as ShadowRoot).adoptedStyleSheets = styles.map((s) =>
//		 s instanceof CSSStyleSheet ? s : s.styleSheet!);
//	}
//	else {
//	  styles.forEach((s) => {
//		 const style = document.createElement('style');
//		 // eslint-disable-next-line @typescript-eslint/no-explicit-any
//		 const nonce = (global as any)['litNonce'];
//		 if (nonce !== undefined)
//				style.setAttribute('nonce', nonce);

//		 style.textContent = (s as CSSResult).cssText;
//		 renderRoot.appendChild(style);
//	  });
//	}
//};
