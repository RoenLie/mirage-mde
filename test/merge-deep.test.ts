import { describe, expect, it } from 'vitest';

import { deepMerge } from '../src/mirage-mde/utilities/deep-merge.js';


describe('deepMerge', () => {
	it('should merge two objects', () => {
		const obj1 = { a: 1, b: 2 };
		const obj2 = { b: 3, c: 4 };
		const result = deepMerge([ obj1, obj2 ]);
		expect(result).toEqual({ a: 1, b: 3, c: 4 });
	});

	it('should merge nested objects', () => {
		const obj3 = { a: { b: 1 } };
		const obj4 = { a: { c: 2 } };
		const result = deepMerge<any>([ obj3, obj4 ]);
		expect(result).toEqual({ a: { b: 1, c: 2 } });
	});

	it('should concatenate arrays by default', () => {
		const arr1 = [ 1, 2, 3 ];
		const arr2 = [ 4, 5, 6 ];
		const result = deepMerge([ arr1, arr2 ]);
		expect(result).toEqual([ 1, 2, 3, 4, 5, 6 ]);
	});

	it('should merge arrays by index when mergeArrays is true', () => {
		const arr3 = [ 1, { a: 1, b: 2 } ];
		const arr4 = [ 2, { a: 3, c: 4 } ];
		const result = deepMerge<any>([ arr3, arr4 ], { mergeArrays: true });
		expect(result).toEqual([ 2, { a: 3, b: 2, c: 4 } ]);
	});

	it('should handle arrays with non-object values', () => {
		const arr5 = [ 1, 2, 3 ];
		const arr6 = [ 4, 'hello', true ];
		const result = deepMerge([ arr5, arr6 ], { mergeArrays: true });
		expect(result).toEqual([ 4, 'hello', true ]);
	});

	it('should handle objects with non-object values', () => {
		const obj5 = { a: 1, b: 'hello', c: true };
		const obj6 = { b: 'world', d: false };
		const result = deepMerge([ obj5, obj6 ]);
		expect(result).toEqual({ a: 1, b: 'world', c: true, d: false });
	});

	it('should handle merging arrays and appending missing entries', () => {
		const obj1 = { a: [ { b: 1 } ] };
		const obj2 = { a: [ { c: 1 }, { d: 1 } ] };
		const result = deepMerge<any>([ obj1, obj2 ], { mergeArrays: true });
		const expected = { a: [ { b: 1, c: 1 }, { d: 1 } ] };

		expect(result).to.deep.equal(expected);
	});

	it('should handle an empty array', () => {
		const result = deepMerge([]);
		expect(result).toEqual({});
	});

	it('should handle an array with a single object', () => {
		const obj7 = { a: 1, b: 2 };
		const result = deepMerge([ obj7 ]);
		expect(result).toEqual({ a: 1, b: 2 });
	});

	it('should handle an array with a single array', () => {
		const arr7 = [ 1, 2, 3 ];
		const result = deepMerge([ arr7 ]);
		expect(result).toEqual([ 1, 2, 3 ]);
	});

	it('should handle two big deeply nested objects that contain both other objects, arrays and values.', () => {
		const obj1 = {
			name:    'Alice',
			age:     30,
			address: {
				street: '123 Main St',
				city:   'Anytown',
				state:  'CA',
				zip:    '12345',
			},
			hobbies: [ 'reading', 'hiking', 'biking' ],
			pets:    [
				{
					name:    'Fido',
					species: 'dog',
					age:     5,
				},
				{
					name:    'Whiskers',
					species: 'cat',
					age:     3,
				},
			],
			heavyEquipment: [ 'lawnmower' ],
		};

		const obj2 = {
			name:    'Bob',
			age:     35,
			address: {
				city:  'Othertown',
				state: 'NY',
			},
			hobbies: [ 'hiking', 'swimming' ],
			pets:    [
				{
					name:    'Buddy',
					species: 'dog',
					age:     2,
					breed:   'golden retriever',
				},
			],
			family: {
				spouse: {
					name: 'Jane',
					age:  32,
				},
				children: [
					{
						name: 'Tom',
						age:  5,
					},
					{
						name: 'Sarah',
						age:  3,
					},
				],
			},
			exSpouses: [
				{
					name: 'Petricia',
					age:  40,
				},
			],
		};

		const expected = {
			name:    'Bob',
			age:     35,
			address: {
				street: '123 Main St',
				city:   'Othertown',
				state:  'NY',
				zip:    '12345',
			},
			hobbies: [ 'reading', 'hiking', 'biking', 'hiking', 'swimming' ],
			pets:    [
				{
					name:    'Fido',
					species: 'dog',
					age:     5,
				},
				{
					name:    'Whiskers',
					species: 'cat',
					age:     3,
				},
				{
					name:    'Buddy',
					species: 'dog',
					age:     2,
					breed:   'golden retriever',
				},
			],
			family: {
				spouse: {
					name: 'Jane',
					age:  32,
				},
				children: [
					{
						name: 'Tom',
						age:  5,
					},
					{
						name: 'Sarah',
						age:  3,
					},
				],
			},
			heavyEquipment: [ 'lawnmower' ],
			exSpouses:      [
				{
					name: 'Petricia',
					age:  40,
				},
			],
		};

		const result = deepMerge<any>([ obj1, obj2 ]);

		expect(result).to.deep.equal(expected);
	});
});
