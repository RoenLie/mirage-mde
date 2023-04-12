import './mirage-mde-icon.js';

import { hasCommonElement } from '@roenlie/mimic/array';
import { html, LitElement, nothing, TemplateResult, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { map } from 'lit/directives/map.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { when } from 'lit/directives/when.js';

import { MirageMDE } from '../mirage-mde.js';
import { Options } from '../mirage-mde-types.js';
import { actionRegister, ToolbarButton } from '../registry/action-registry.js';
import { isMobile } from '../utilities/is-mobile.js';
import styles from './mirage-mde-toolbar.scss?inline';


@customElement('mirage-mde-toolbar')
export class ToolbarElement extends LitElement {

	@property({ type: Object }) public scope: MirageMDE;
	@state() private items: Options['toolbar'] = [];

	public create() {
		this.items = this.scope.toolbar.filter(
			action => !this.scope.options.hideIcons?.includes(action),
		);
	}

	protected createTooltip(item: ToolbarButton) {
		let tooltip = item.title ?? '';
		if (item.shortcut)
			tooltip += ` ( ${ item.shortcut.toUpperCase().replace('C-', 'Ctrl ') } )`;

		if (navigator.userAgent.includes('Mac OS X')) {
			tooltip = tooltip.replace('Ctrl', '⌘');
			tooltip = tooltip.replace('Alt', '⌥');
		}

		return tooltip;
	}

	protected toolbarButtonTemplate(item: ToolbarButton) {
		const title = this.createTooltip(item);

		const listener = (ev: Event) => {
			ev.preventDefault();
			if (typeof item.action === 'function')
				item.action(this.scope.editor, this.scope);
			if (typeof item.action === 'string')
				globalThis.open(item.action, '_blank');
		};

		const elRef = createRef<HTMLElement>();
		this.scope.toolbarElements[item.name] = elRef;

		const previewActive = !!this.scope.options.host?.classList.contains('preview');
		const disabled = (!!item.noMobile && isMobile()) || (previewActive && !item.noDisable);
		const active = hasCommonElement(this.scope.activeMarkers, item.marker ?? []);

		return html`
		<button
			tabindex  ="-1"
			type      ="button"
			class     =${ classMap({ active }) }
			title     =${ title }
			aria-label=${ item.title }
			?disabled =${ disabled }
			@click    =${ listener }
			${ ref(elRef) }
		>
			${ item?.text ?? nothing }
			${ when(item.iconUrl, () => html`
			<mirage-mde-icon
				url=${ item.iconUrl ?? '' }
			></mirage-mde-icon>
			`) }
		</button>
		`;
	}

	protected override render() {
		return html`
		<div class="editor-toolbar" role="toolbar">
			${ map(this.items, item => {
				const action = actionRegister.get(item);
				if (!action)
					return nothing;

				if (action.type === 'separator')
					return html`<i class="separator">|</i>`;

				const templates: TemplateResult[] = [];

				// Needs to be implemented
				if (action.type === 'dropdown')
					return nothing;

				if (action.type === 'button') {
					templates.push(this.toolbarButtonTemplate(action));

					if (action.name === 'upload-image') {
						templates.push(html`
						<input
							style=${ styleMap({ display: 'none' }) }
							class="imageInput"
							type="file"
							name="image"
							?multiple=${ true }
							.accept=${ this.scope.options.imageAccept ?? '' }
						/>
						`);
					}
				}

				return map(templates, t => t);
			}) }
		</div>
		`;
	}

	public static override styles = [ unsafeCSS(styles) ];

}


declare global {
	interface HTMLElementTagNameMap {
		'mirage-mde-toolbar': ToolbarElement;
	}
}
