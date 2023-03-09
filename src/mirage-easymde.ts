// @ts-expect-error
import hljs from 'highlight.js';
import { css, html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';

import { EasyMDE } from './mirage-mde/EasyMDE.js';
import hljsTheme from './mirage-mde/github-dark-dimmed.css?raw';
import main from './mirage-mde/main.css?raw';
import { EasyMDEBase } from './mirage-mde/types.js';


@customElement('mirage-easymde')
export class MirageEasyMDE extends LitElement {

	protected easyMDE: EasyMDEBase;

	public override connectedCallback() {
		super.connectedCallback();

		this.updateComplete.then(() => {
			this.easyMDE = new EasyMDE({
				element:         this.renderRoot.querySelector('#my-text-area') as HTMLElement,
				renderingConfig: {
					singleLineBreaks:       false,
					codeSyntaxHighlighting: true,
					hljs:                   hljs,
			  },
			});
		});
	}

	protected override render() {
		return html`
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css">
		<textarea id="my-text-area"></textarea>
		`;
	}

	public static override styles = [
		unsafeCSS(main),
		unsafeCSS(hljsTheme),
		css`
		:host {
			font-family: Helvetica;
		}
		`,
	];

}
