// @ts-expect-error
import hljs from 'highlight.js';
import { css, html, LitElement, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';

import { MirageMDE } from './mirage-mde.js';
import { type Options } from './mirage-mde-types.js';
import hljsTheme from './styles/github-dark-dimmed.css?inline';
import main from './styles/main.css?inline';


@customElement('mirage-mde')
export class MirageMDEElement extends LitElement {

	@property({ type: Object }) public options: Options = {};
	public mirageMDE?: MirageMDE;

	public override connectedCallback() {
		super.connectedCallback();

		this.updateComplete.then(() => {
			this.mirageMDE = new MirageMDE({
				autoDownloadFontAwesome: true,
				renderingConfig:         {
					singleLineBreaks:       false,
					codeSyntaxHighlighting: true,
					hljs:                   hljs,
				},
				...this.options,
				element: this.renderRoot.querySelector('textarea')!,
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
			display: grid;
			overflow: hidden;
		}
		`,
	];

}


declare global {
	interface HTMLElementTagNameMap {
		'mirage-mde': MirageMDEElement;
	}
}
