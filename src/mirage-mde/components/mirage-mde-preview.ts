import './mirage-mde-display.js';

import { css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { EnhancedElement } from '../../utilities/enhanced-element.js';
import { MirageMDE } from '../mirage-mde.js';


@customElement('mirage-mde-preview')
export class PreviewElement extends EnhancedElement {

	@property({ type: Object }) public scope: MirageMDE;
	@state() protected htmlContent: string;
	protected editorScroll = false;
	protected previewScroll = false;
	protected isCreated = false;

	public setContent(htmlString: string) {
		this.htmlContent = htmlString;
	}

	public create() {
		// Only allow creating once.
		if (this.isCreated)
			return;

		this.isCreated = true;
		this.scope.gui.preview = this;

		// Syncs scroll  editor -> preview
		this.scope.codemirror.on('scroll', (v) => {
			if (this.editorScroll)
				return this.editorScroll = false;

			this.previewScroll = true;

			const height = v.getScrollInfo().height - v.getScrollInfo().clientHeight;
			const ratio = parseFloat(String(v.getScrollInfo().top)) / height;
			const move = (this.scrollHeight - this.clientHeight) * ratio;

			this.scrollTop = move;
		});

		// Syncs scroll  preview -> editor
		this.addEventListener('scroll', this.handlePreviewScroll);
	}

	public override disconnectedCallback() {
		super.disconnectedCallback();

		this.removeEventListener('scroll', this.handlePreviewScroll);
	}

	protected handlePreviewScroll = () => {
		const cm = this.scope.codemirror;

		if (this.previewScroll)
			return this.previewScroll = false;

		this.editorScroll = true;

		const height = this.scrollHeight - this.clientHeight;
		const ratio = parseFloat(String(this.scrollTop)) / height;
		const move = (cm.getScrollInfo().height - cm.getScrollInfo().clientHeight) * ratio;

		cm.scrollTo(0, move);
	};

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
