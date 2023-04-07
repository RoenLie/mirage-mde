class TransformIterable<T, R> {

	protected transformers: ((value: T) => R)[] = [];

	constructor(protected iterable: Iterable<T>) { }

	public [Symbol.iterator](): Iterator<Exclude<R, undefined>> {
		const iterator = this.iterable[Symbol.iterator]();
		let hasNext = true;

		return {
			next: (): any => {
				while (hasNext) {
					const nextValue = iterator.next();
					let value: R = nextValue.value;

					if (nextValue.done) {
						hasNext = false;

						return { done: true, value: undefined };
					}

					let shouldYield = true;

					for (const transformer of this.transformers) {
						const result = transformer(value as unknown as T);
						if (result === undefined) {
							shouldYield = false;

							break;
						}

						value = result;
					}

					if (!shouldYield)
						continue;

					return { done: false, value: value };
				}

				return { done: true, value: undefined };
			},
		};
	}

}


export class IterableTransformer<T, R> extends TransformIterable<T, R> {

	constructor(iterable: Iterable<T>, transformers: ((value: T) => R)[]) {
		super(iterable);

		this.transformers.push(...transformers);
	}

	public transform<R2>(transformer: (value: Exclude<T, undefined>) => R2) {
		const iterable = this.iterable;

		return new IterableTransformer<R2, R2>(iterable as any, [ ...this.transformers, transformer as any ]);
	}

	public toArray(): R[] {
		const transformedArray: R[] = [];

		for (const item of this)
			transformedArray.push(item);

		return transformedArray;
	}

}


export class IterablePipeline<T, R, O = T> extends TransformIterable<T, R> {

	constructor(iterable: Iterable<T>, transformers: ((value: T) => R)[]) {
		super(iterable);

		this.transformers.push(...transformers);
	}

	public transform<R2>(transformer: (value: Exclude<T, undefined>) => R2) {
		const iterable = this.iterable;

		return new IterablePipeline<R2, R2, O>(iterable as any, [ ...this.transformers, transformer as any ]);
	}

	public toPipeline() {
		return (iterable: Iterable<O>) => {
			const cls =  new IterableTransformer<O, R>(iterable, this.transformers as any);

			return [ ...cls ];
		};
	}

}


export function iterate<T>(): IterablePipeline<T, unknown>
export function iterate<T>(iterable: Iterable<T>): IterableTransformer<T, unknown>
export function iterate<T>(iterable?: any): any {
	if (iterable)
		return new IterableTransformer<T, unknown>(iterable, []);

	return new IterablePipeline<T, unknown>([], []);
}
