import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { map } from 'lit/directives/map.js';

import { MirageMDE } from '../mirage-mde.js';
import { wordCount } from '../utilities/word-count.js';
import styles from './mirage-mde-statusbar.scss?inline';


type Item = {
	value: string;
	className: string;
	id?: string;
	onUpdate?: () => string;
	onActivity?: () => string;
}


@customElement('mirage-mde-statusbar')
export class StatusbarElement extends LitElement {

	@property({ type: Object }) public scope: MirageMDE;
	@state() protected items: Item[] = [];
	protected itemProps: Record<string, Item>;

	public create() {
		const options = this.scope.options;
		const status = options.status;
		const cm = this.scope.codemirror;

		// Make sure the status is valid
		if (!status)
			return;

		this.itemProps = {
			'words': {
				value:     String(wordCount(cm.getValue())),
				className: 'words',
				onUpdate:  () => String(wordCount(cm.getValue())),
			},
			'lines': {
				value:     String(cm.lineCount()),
				className: 'lines',
				onUpdate:  () => String(cm.lineCount()),
			},
			'cursor': {
				value:      '1:1',
				className:  'cursor',
				onActivity: () => {
					const pos = cm.getCursor();
					const posLine = pos.line + 1;
					const posColumn = pos.ch + 1;

					return posLine + ':' + posColumn;
				},
			},
			'autosave': {
				id:        'autosaved',
				value:     '',
				className: 'autosave',
			},
			'upload-image': {
				value:     options.imageTexts?.sbInit ?? '',
				className: 'upload-image',
			},
		};

		// Set up the built-in items
		this.items = status.map(item => {
			// Handle if custom or not
			if (typeof item === 'object') {
				return {
					value:      item.value,
					className:  item.className,
					onUpdate:   item.onUpdate,
					onActivity: item.onActivity,
				};
			}

			return this.itemProps[item]!;
		});

		this.items.forEach(item => {
			if (item.onUpdate) {
				this.scope.codemirror.on('update', () => {
					if (item.onUpdate) {
						item.value = item.onUpdate();
						this.items = [ ...this.items ];
					}
				});
			}
			if (item.onActivity) {
				this.scope.codemirror.on('cursorActivity', () => {
					if (item.onActivity) {
						item.value = item.onActivity();
						this.items = [ ...this.items ];
					}
				});
			}
		});
	}

	protected override render() {
		return html`
		<div class="editor-statusbar">
		${ map(this.items, item => {
			return html`
			<span id=${ ifDefined(item.id) } class=${ item.className }>
				${ item.value }
			</span>
			`;
		}) }
		</div>
		`;
	}

	public static override styles = [ unsafeCSS(styles) ];

}


declare global {
	interface HTMLElementTagNameMap {
		'mirage-mde-statusbar': StatusbarElement;
	}
}
