interface SudokuCell {
	row: number;
	col: number;
	value?: number;
	candidates: Set<number>;
}

interface SudokuXWing {
	groupType: 'row' | 'col';
	groupIndex: number;
	candidate: number;
}

class SudokuPuzzle {

	private readonly size: number;
	private readonly blockSize: number;
	private readonly cells: SudokuCell[];

	constructor(puzzleString: string) {
		this.size = 9;
		this.blockSize = 3;
		this.cells = [];

		// Parse puzzle string into cells
		for (let i = 0; i < puzzleString.length; i++) {
			const row = Math.floor(i / this.size);
			const col = i % this.size;
			const value = puzzleString.charAt(i) === '.'
				? undefined
				: parseInt(puzzleString.charAt(i));

			const candidates = value
				? new Set<number>()
				: new Set(Array.from({ length: this.size }, (_, i) => i + 1));

			this.cells.push({ row, col, value, candidates });
		}
	}

	private getCell(row: number, col: number): SudokuCell {
		return this.cells[row * this.size + col]!;
	}

	private getRow(row: number): SudokuCell[] {
		return this.cells.filter(cell => cell.row === row);
	}

	private getCol(col: number): SudokuCell[] {
		return this.cells.filter(cell => cell.col === col);
	}

	private getBlock(row: number, col: number): SudokuCell[] {
		const blockRow = Math.floor(row / this.blockSize);
		const blockCol = Math.floor(col / this.blockSize);

		return this.cells.filter(cell => Math.floor(cell.row / this.blockSize) === blockRow && Math.floor(cell.col / this.blockSize) === blockCol);
	}

	private getGroupCells(groupType: 'row' | 'col', groupIndex: number): SudokuCell[] {
		return groupType === 'row' ? this.getRow(groupIndex) : this.getCol(groupIndex);
	}

	private findXWing(groupType: 'row' | 'col', candidate: number): SudokuXWing | undefined {
		// Find all groups (rows or columns) that contain the candidate in exactly two cells
		const groups: SudokuCell[][] = [];
		for (let i = 0; i < this.size; i++) {
			const group = groupType === 'row' ? this.getRow(i) : this.getCol(i);
			const candidateCells = group.filter(cell => cell.candidates.has(candidate));
			if (candidateCells.length === 2 && candidateCells.every(cell => cell.candidates.size === 2))
				groups.push(candidateCells);
		}

		// Find all pairs of groups that share exactly two cells
		const pairs = [];
		for (let i = 0; i < groups.length - 1; i++) {
			for (let j = i + 1; j < groups.length; j++) {
				const intersection = groups[i]!.filter(cell => groups[j]!.includes(cell));
				if (intersection.length === 2)
					pairs.push([ groups[i], groups[j] ]);
			}
		}

		// Return the X-Wing if one exists
		for (const [ group1, group2 ] of pairs) {
			const cells = new Set([ ...group1!, ...group2! ]);
			if (cells.size === 4) {
				const rows = new Set([ ...group1!.map(cell => cell.row), ...group2!.map(cell => cell.row) ]);
				const cols = new Set([ ...group1!.map(cell => cell.col), ...group2!.map(cell => cell.col) ]);
				if (rows.size === 2 && cols.size === 2) {
					const xwing: SudokuXWing = {
						candidate,
						rows: Array.from(rows),
						cols: Array.from(cols),
					};

					return xwing;
				}
			}
		}

		return undefined;
	}

	private eliminateXWing(xwing: SudokuXWing): boolean {
		// Eliminate candidate from other rows/columns in the same blocks as the X-Wing
		const xwingCells = this.getGroupCells(xwing.groupType, xwing.groupIndex)
			.filter(cell => cell.candidates.has(xwing.candidate));

		for (const cell of xwingCells) {
			const otherGroupCells = xwing.groupType ===  'row'
				? this.getBlock(cell.row, cell.col)
				: this.getBlock(cell.col, cell.row);

			for (const otherCell of otherGroupCells) {
				if (otherCell.candidates.delete(xwing.candidate)) {
					if (otherCell.candidates.size === 1) {
						// If this cell is now the only candidate, fill in the value
						const [ value ] = Array.from(otherCell.candidates);
						otherCell.candidates.clear();
						otherCell.value = value;
						if (!this.checkValidity())
							return false;
					}
				}
			}
		}

		return true;
	}

	private checkValidity(): boolean {
		// Check that all groups (rows, columns, blocks) contain unique values
		const groups = [];
		for (let i = 0; i < this.size; i++)
			groups.push(this.getRow(i), this.getCol(i), this.getBlock(0, i), this.getBlock(3, i), this.getBlock(6, i));

		for (const group of groups) {
			const values = group
				.filter(cell => cell.value !== undefined)
				.map(cell => cell.value!) as number[];

			if (new Set(values).size !== values.length)
				return false;
		}

		return true;
	}

	public async solve(): Promise<boolean> {
		while (true) {
			let progress = false;

			const promise = new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
			await promise;

			// Find all X-Wings for each candidate
			for (let candidate = 1; candidate <= this.size; candidate++) {
				const xwingRow = this.findXWing('row', candidate);
				const xwingCol = this.findXWing('col', candidate);

				if (xwingRow) {
					progress = this.eliminateXWing(xwingRow);
					if (!progress)
						return false;
				}

				if (xwingCol) {
					progress = this.eliminateXWing(xwingCol);
					if (!progress)
						return false;
				}
			}

			console.log({ progress });

			// If we have made no progress, stop looping
			if (!progress)
				break;
		}

		//let progress = true;

		//while (progress) {
		//	progress = false;

		//	const promise = new Promise<boolean>(resolve => {
		//		// Find all X-Wings for each candidate
		//		for (let candidate = 1; candidate <= this.size; candidate++) {
		//			const xwingRow = this.findXWing('row', candidate);
		//			const xwingCol = this.findXWing('col', candidate);

		//			//console.log(candidate);
		//			console.log(xwingRow, xwingCol);

		//			if (xwingRow) {
		//				progress = this.eliminateXWing(xwingRow);
		//				resolve(progress);
		//			}

		//			if (xwingCol) {
		//				progress = this.eliminateXWing(xwingCol);
		//				resolve(progress);
		//			}
		//		}

		//		resolve(false);
		//	});

		//	console.log('waiting for an iteration');

		//	progress = await promise;

		//	console.log('done with one iteration');


		//	// If we have made no progress, stop looping
		//	if (!progress)
		//		break;
		//}

		// Check final validity before considering the puzzle solved
		return this.checkValidity();
	}

	public toString(): string {
		let output = '';
		for (let row = 0; row < this.size; row++) {
			for (let col = 0; col < this.size; col++) {
				const cell = this.getCell(row, col);
				const value = cell.value ?? '.';
				output += value.toString();
				if (col < this.size - 1)
					output += ' ';
			}
			output += '\n';
		}

		return output;
	}

}

const puzzleString = '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
const puzzle = new SudokuPuzzle(puzzleString);
console.log('Initial puzzle:');
console.log(puzzle.toString());
if (await puzzle.solve()) {
	console.log('Solved puzzle:');
	console.log(puzzle.toString());
}
else {
	console.log('Could not solve puzzle.');
}
