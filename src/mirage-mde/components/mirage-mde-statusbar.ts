import { iterate } from '@roenlie/mimic/iterators';
import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { when } from 'lit/directives/when.js';

import { MirageMDE } from '../mirage-mde.js';
import { StatusBarItem, statusRegistry } from '../registry/status-registry.js';
import styles from './mirage-mde-statusbar.scss?inline';


@customElement('mirage-mde-statusbar')
export class StatusbarElement extends LitElement {

	@property({ type: Object }) public scope: MirageMDE;
	@state() protected items: StatusBarItem[] = [];

	public create() {
		this.items = iterate(statusRegistry)
			.pipe(([ name, item ]) => {
				if (this.scope.statusbar.includes(name))
					return item;
			})
			.toArray();
	}

	protected override render() {
		if (!this.scope)
			return;

		return html`
		${ map(this.items, (item) => {
			return html`
			<span>
				${ when(item.css, () => html`
				<style>
					${ item.css?.(item, this.scope.editor, this.scope) }
				</style>
				`) }
				${ unsafeHTML(item.template(item, this.scope.editor, this.scope)) }
			</span>
			`;
		}) }
		`;
	}

	public static override styles = [ unsafeCSS(styles) ];

}


declare global {
	interface HTMLElementTagNameMap {
		'mirage-mde-statusbar': StatusbarElement;
	}
}
