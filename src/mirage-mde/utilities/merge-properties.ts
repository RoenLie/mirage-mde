/**
 * Merges the properties of the source object into the target object.
 * @param target The target object to merge properties into.
 * @param source The source object containing properties to merge.
 * @returns The target object with merged properties.
 */
export const mergeProperties = <
	T extends Record<keyof any, any>,
	S extends Record<keyof any, any>
>(target: T, source: S): T & S => {
	for (const property in source) {
		if (!source.hasOwnProperty(property))
			continue;

		if (Array.isArray(source[property])) {
			let rest = Array.isArray(target[property])
				? target[property] : [];

			target[property] = source[property].concat(rest);

			continue;
		}

		if (
			source[property] !== null &&
				typeof source[property] === 'object' &&
				source[property].constructor === Object
		) {
			target[property] = mergeProperties(target[property] || {}, source[property]);
			continue;
		}

		target[property] = source[property];
	}

	return target as T & S;
};


/**
  * Merges an arbitrary number of objects into one.
  * @param objects A list of objects to be merged.
  * @returns A single object containing the merged properties of all objects.
  */
export const extend = <T extends Record<keyof any, any>>(...objects: Partial<T>[]): T => {
	const [ head, ...tail ] = objects;
	let target: Partial<T> = head!;

	// Loop through the rest of the objects and merge their properties into the target object.
	for (const obj of tail)
		target = mergeProperties(target, obj);

	return target as T;
};
