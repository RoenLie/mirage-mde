import './mirage-mde-display.js';

import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { handlePreviewScroll } from '../actions/toggle-sidebyside.js';
import { MirageMDE } from '../mirage-mde.js';


@customElement('mirage-mde-preview')
export class PreviewElement extends LitElement {

	@property({ type: Object }) public scope: MirageMDE;
	@state() protected htmlContent: string | Promise<string>;
	public editorScroll = false;
	public previewScroll = false;
	protected isCreated = false;

	public setContent(htmlString: string): void
	public setContent(htmlString: Promise<string>): Promise<string>
	public setContent(htmlString: any): any {
		if (typeof htmlString === 'string')
			this.htmlContent = htmlString;
		else if (htmlString)
			return htmlString.then((s: string) => this.htmlContent = s);
	}

	public create() {
		// Only allow creating once.
		if (this.isCreated)
			return;

		this.isCreated = true;

		// Syncs scroll  preview -> editor
		this.addEventListener('scroll', this.handlePreviewScroll);
	}

	public override disconnectedCallback() {
		super.disconnectedCallback();

		this.removeEventListener('scroll', this.handlePreviewScroll);
	}

	protected handlePreviewScroll = (ev: Event) => handlePreviewScroll(ev, this.scope);

	protected override render() {
		return html`
		<mirage-mde-display
			.content=${ this.htmlContent }
		></mirage-mde-display>
		`;
	}

	public static override styles = [
		css`
		* {
			box-sizing: border-box;
		}
		:host {
			display: grid;
			overflow: auto;
			border: var(--mmde-border);
			border-left: none;
			border-bottom: none;
		}
		:host::-webkit-scrollbar {
			width: var(--mmde-scrollsize);
			height: var(--mmde-scrollsize);
		}
		:host::-webkit-scrollbar-track {
			background: var(--mmde-scrollbg);
		}
		:host::-webkit-scrollbar-thumb {
			background: var(--mmde-scrollthumb);
			border-radius: 0px;
			background-clip: padding-box;
		}
		:host::-webkit-scrollbar-corner {
			background: var(--mmde-scrollbg);
		}
		`,
	];

}


declare global {
	interface HTMLElementTagNameMap {
		'mirage-mde-preview': PreviewElement;
	}
}
