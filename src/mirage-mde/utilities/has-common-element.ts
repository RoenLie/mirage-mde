/**
 * Determines if there is any common element between two given arrays.
 */
export const hasCommonElement = (arr1: unknown[], arr2: unknown[]): boolean => {
	const set = new Set(arr1);
	for (const item of arr2) {
		if (set.has(item))
			return true;
	}

	return false;
};

// Example usage:
// const array1 = ['apple', 'banana', 'orange'];
// const array2 = ['grape', 'banana', 'kiwi'];
// console.log(hasCommonElement(array1, array2)); // Output: true
