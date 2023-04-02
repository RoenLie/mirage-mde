import { LitElement, PropertyValueMap } from 'lit';


type StringLiteral = string & Record<never, never>;


export class EnhancedElement extends LitElement {

	#updateSubscribers: [property: 'all' | StringLiteral, callback: () => void][] = [];
	#firstUpdateAfterConnecting = true;

	public addUpdateSubscriber(property: string, callback: () => void) {
		this.#updateSubscribers.push([ property, callback ]);
	}

	public removeUpdateSubscriber(property: 'all' | StringLiteral, callback: () => void): void {
		const index = this.#updateSubscribers.findIndex(
			sub => sub[0] === property && sub[1] === callback,
		);

		if (index > -1)
			this.#updateSubscribers.splice(index, 1);
	}

	public override connectedCallback(): void {
		super.connectedCallback();

		this.#firstUpdateAfterConnecting = true;
	}

	public override disconnectedCallback(): void {
		super.disconnectedCallback();

		this.#updateSubscribers.length = 0;
	}

	protected override updated(props: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
		super.updated(props);


		this.#updateSubscribers.forEach(([ property, callback ]) => {
			if (props.has(property) || property === 'all')
				callback();
		});

		if (this.#firstUpdateAfterConnecting)
			this.afterConnected();
	}

	/**
	 * Invoked after the `connectedCallback` and  first `updated` call has completed.
	 * Can be used as a one time per connected cycle, to safely handle DOM related operations.
	 */
	protected afterConnected() {
		this.#firstUpdateAfterConnecting = false;
	}

}
