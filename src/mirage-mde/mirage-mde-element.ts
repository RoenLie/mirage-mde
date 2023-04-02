import './components/mirage-mde-editor.js';
import './components/mirage-mde-toolbar.js';
import './components/mirage-mde-statusbar.js';
import './components/mirage-mde-preview.js';

// @ts-expect-error
import hljs from 'highlight.js';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { classMap } from 'lit/directives/class-map.js';

import { MirageMDE } from './mirage-mde.js';
import { type Options } from './mirage-mde-types.js';


@customElement('mirage-mde')
export class MirageMDEElement extends LitElement {

	@property({ type: Object }) public options: Options = {};
	public scope?: MirageMDE;

	public override async connectedCallback() {
		super.connectedCallback();
		await this.updateComplete;

		this.scope = new MirageMDE({
			host:                  this,
			toolbarTooltips:       true,
			uploadImage:           false,
			previewImagesInEditor: false,
			lineNumbers:           true,
			autosave:              undefined,
			renderingConfig:       {
				singleLineBreaks:       false,
				codeSyntaxHighlighting: true,
				hljs:                   hljs,
			},
			...this.options,
		});

		this.requestUpdate();
		await this.updateComplete;

		const editor    = this.renderRoot.querySelector('mirage-mde-editor');
		this.scope.gui.editor = editor!;

		const toolbar   = this.renderRoot.querySelector('mirage-mde-toolbar');
		this.scope.gui.toolbar = toolbar!;

		const preview   = this.renderRoot.querySelector('mirage-mde-preview');
		this.scope.gui.preview = preview!;

		const statusbar = this.renderRoot.querySelector('mirage-mde-statusbar');
		this.scope.gui.statusbar = statusbar!;

		[ editor, toolbar, statusbar, preview ].forEach(el => el?.create());
	}

	protected override render() {
		return html`
		<mirage-mde-toolbar
			.scope=${ this.scope }
			class=${ classMap(this.scope?.guiClasses.toolbar ?? {}) }
		></mirage-mde-toolbar>

		<mirage-mde-editor
			.scope=${ this.scope }
			class=${ classMap(this.scope?.guiClasses.editor ?? {}) }
		></mirage-mde-editor>

		<mirage-mde-preview
			.scope=${ this.scope }
			class=${ classMap(this.scope?.guiClasses.preview ?? {}) }
		></mirage-mde-preview>

		<mirage-mde-statusbar
			.scope=${ this.scope }
			class=${ classMap(this.scope?.guiClasses.statusbar ?? {}) }
		></mirage-mde-statusbar>
		`;
	}

	public static override styles = [
		css`
		:host {
			--mmde-border-radius: 0px;
			--mmde-border: 2px solid rgb(30, 40, 50);
			--mmde-color: rgb(220, 220, 220);
			--mmde-background-color: rgb(13, 17, 23);
			--mmde-toolbar-bg: rgb(30, 40, 50);
			--mmde-scrollbg: rgb(30 40 50 / 75%);
			--mmde-scrollthumb: rgb(52, 70, 88);
			--mmde-scrollsize: 12px;
		}
		:host {
			font-family: Helvetica;
			overflow: hidden;

			min-height: 300px;
			height: 300px;
			resize: vertical;

			display: grid;
			grid-template: "toolbar" auto
								"editor" 1fr
								"statusbar" auto
								/ 1fr;
		}
		:host(.preview) {
			grid-template: "toolbar" auto
								"sidebyside" 1fr
								"statusbar" Auto
								/ 1fr;
		}
		:host(.sidebyside) {
			grid-template: "toolbar toolbar" auto
								"editor sidebyside" 1fr
								"statusbar statusbar" Auto
								/ 1fr 1fr
		}
		:host(.fullscreen) {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			resize: none;
		}
		.hidden {
			display: none;
		}
		mirage-mde-toolbar {
			grid-area: toolbar;
		}
		mirage-mde-editor {
			grid-area: editor;
		}
		mirage-mde-statusbar {
			grid-area: statusbar;
		}
		mirage-mde-preview {
			grid-area: sidebyside;
		}
		`,
	];

}


declare global {
	interface HTMLElementTagNameMap {
		'mirage-mde': MirageMDEElement;
	}
}
