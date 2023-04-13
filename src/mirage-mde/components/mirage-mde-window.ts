import { css, html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { editorToPreview } from '../codemirror/commands/toggle-sidebyside.js';
import { MirageMDE } from '../mirage-mde.js';
import codeDarkStyles from '../styles/code-dark.scss?inline';
import markdownDarkStyles from '../styles/markdown-dark.scss?inline';
import markdownLightStyles from '../styles/markdown-light.scss?inline';
import { CrossDocElement } from './cross-doc-element.js';


@customElement('mirage-mde-window')
export class WindowElement extends CrossDocElement {

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
export class WindowDisplayElement extends CrossDocElement {

	@property() public theme: 'light' | 'dark' = 'dark';
	@property() public content = '';

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
		:host .markdown-body {
			padding: 4px;
			word-break: break-word;
			place-self: start center;

			width: clamp(500px, 70vw, 800px);
			border-radius: 4px;

			min-height: calc(100dvh - 50px);
			margin-top: 22px;
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
