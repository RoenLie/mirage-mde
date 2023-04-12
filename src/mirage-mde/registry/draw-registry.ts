import { StringLiteral } from '@roenlie/mimic/types';


export type BuiltInDrawables = [
	'table',
	'horizontalRule',
	'link',
	'image',
	'uploadedImage'
][number];


export const drawRegistry = new Map<StringLiteral | BuiltInDrawables, string>([
	[
		'table', `
		| Column 1 | Column 2 | Column 3 |
		| -------- | -------- | -------- |
		| Text     | Text     | Text     |
		`,
	],
	[
		'horizontalRule', `
		-----
		`,
	],
	[ 'link', `[' '](#url#)` ],
	[ 'image', `![' '](#url#)` ],
	[ 'uploadedImage', `![](#url#)` ],
]);
