import { EditorState } from '@codemirror/state';


const whitespace = [ ' ', '\t', '\n', '\r' ];


export const findBeginningOfWord = (input: string, position: number): number | undefined => {
	if (position < 0 || position >= input.length)
		return 0;

	for (let i = position; i >= 0; i--) {
		if (whitespace.includes(input[i]!))
			return i - 1;
	}

	return 0;
};

export const findEndOfWord = (input: string, position: number): number | undefined => {
	if (position < 0 || position >= input.length)
		return input.length - 1;

	for (let i = position; i < input.length; i++) {
		if (whitespace.includes(input[i]!))
			return i + 1;
	}

	return input.length - 1;
};

export const cmFindBeginningOfWord = (
	position: number,
	state: EditorState,
): number | undefined => {
	if (position < 0)
		return 0;

	for (let i = position; i >= 0; i--) {
		const substring = state.doc.sliceString(i - 1, i);
		if (whitespace.includes(substring))
			return i;
	}

	return 0;
};

export const cmfindEndOfWord = (
	position: number,
	state: EditorState,
): number | undefined => {
	if (position < 0)
		return 0;

	let i = position;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const substring = state.doc.sliceString(i, i + 1);
		if (substring === undefined)
			break;

		if (whitespace.includes(substring))
			return i;

		i++;
	}

	return i;
};

export const findFirstWordToLastWord = (state: EditorState) => {
	const ranges = state.selection.ranges.map((value) => {
		const start = cmFindBeginningOfWord(value.from, state);
		const end = cmfindEndOfWord(value.to, state);

		return [ start, end ];
	});

	return ranges as [start: number, end: number][];
};
