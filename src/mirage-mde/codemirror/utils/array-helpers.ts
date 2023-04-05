/**
 * Returns the sum of all numbers in an array of numbers.
 */
export const arraySum = (arr: (number | null | undefined)[]) => arr.reduce((acc: number, cur) => acc += cur ?? 0, 0);


/**
 * Returns the sum of all numbers in an array of objects using a prop function.
 */
export const arrayObjSum = <T extends Record<keyof any, any>>(
	arr: T[], prop: (obj: T) => any,
) => arr.reduce((acc: number, cur) => acc += prop(cur) ?? 0, 0);
