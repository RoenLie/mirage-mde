import { css, html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import codeDarkStyles from '../styles/code-dark.scss?inline';
import markdownDarkStyles from '../styles/markdown-dark.scss?inline';
import markdownLightStyles from '../styles/markdown-light.scss?inline';


@customElement('mirage-mde-display')
export class DisplayElement extends LitElement {

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
		:host, * {
			box-sizing: border-box;
		}
		:host {
			display: grid;
		}
		.markdown-body {
			padding: 4px;
			word-break: break-word;
		}
		`,
	];

}


declare global {
	interface HTMLElementTagNameMap {
		'mirage-mde-display': DisplayElement;
	}
}
