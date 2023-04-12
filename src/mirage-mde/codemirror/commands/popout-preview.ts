import { html, LitElement } from 'lit';
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
	winHandle?.document.head.appendChild(winDarkMarkdownStyle);
	winHandle?.document.head.appendChild(winLightMarkdownStyle);
	winHandle?.document.head.appendChild(winDarkCodeStyle);

	const previewEl = document.createElement('mirage-mde-window');
	previewEl.scope = scope;

	winHandle?.document.body.appendChild(previewEl);

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

	public override connectedCallback(): void {
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

	protected override createRenderRoot() {
		return this;
	}

	protected override render() {
		return html`
		<div class=${ classMap({ 'markdown-body': true, [this.theme]: true }) }>
			${ unsafeHTML(this.content) }
		</div>
		`;
	}

}


declare global {
	interface HTMLElementTagNameMap {
		'mirage-mde-window': WindowElement;
		'mirage-mde-window-display': WindowDisplayElement;
	}
}
