import { range } from '@roenlie/mimic/array';
import { clone } from '@roenlie/mimic/structs';


type Board = number[][];


function isValidSudoku(board: Board): boolean {
	const size = board.length;
	const blockSize = Math.sqrt(size);

	// Check rows
	for (let row = 0; row < size; row++) {
		const seen = new Set<number>();
		for (let col = 0; col < size; col++) {
			const num = board[row]![col]!;
			if (num !== 0) {
				if (seen.has(num))
					return false;

				seen.add(num);
			}
		}
	}

	// Check columns
	for (let col = 0; col < size; col++) {
		const seen = new Set<number>();
		for (let row = 0; row < size; row++) {
			const num = board[row]![col]!;
			if (num !== 0) {
				if (seen.has(num))
					return false;

				seen.add(num);
			}
		}
	}

	// Check blocks
	for (let blockRow = 0; blockRow < size; blockRow += blockSize) {
		for (let blockCol = 0; blockCol < size; blockCol += blockSize) {
			const seen = new Set<number>();
			for (let row = blockRow; row < blockRow + blockSize; row++) {
				for (let col = blockCol; col < blockCol + blockSize; col++) {
					const num = board[row]![col]!;
					if (num !== 0) {
						if (seen.has(num))
							return false;

						seen.add(num);
					}
				}
			}
		}
	}

	return true;
}


class SudokuNakedGroup {

	private board: Board;
	private size: number;
	private blockSize: number;
	private range: number[];

	constructor(board: Board) {
		this.board = board;
		this.size = board.length;
		this.blockSize = Math.round(Math.sqrt(this.size));
		this.range = range(1, this.size);
	}

	private isValidNaked(num: number, row: number, col: number): boolean {
		for (let i = 0; i < this.size; i++) {
			if (this.board[row]![i] === num || this.board[i]![col] === num)
				return false;
		}

		const blockRow = Math.floor(row / this.blockSize) * this.blockSize;
		const blockCol = Math.floor(col / this.blockSize) * this.blockSize;
		for (let i = 0; i < this.blockSize; i++) {
			for (let j = 0; j < this.blockSize; j++) {
				if (this.board[blockRow + i]![blockCol + j] === num)
					return false;
			}
		}

		return true;
	}

	private getAvailableNumbersNaked(row: number, col: number): number[] {
		const availableNumbers = new Set<number>();
		for (let num = 1; num <= this.size; num++) {
			if (this.isValidNaked(num, row, col))
				availableNumbers.add(num);
		}

		return Array.from(availableNumbers);
	}

	public solveNakedGroups(groupSize: number): boolean {
		let updated = false;

		for (let row = 0; row < this.size; row++) {
			for (let col = 0; col < this.size; col++) {
				if (this.board[row]![col] === 0) {
					const availableNumbers = this.getAvailableNumbersNaked(row, col);
					if (availableNumbers.length === groupSize) {
						this.board[row]![col] = availableNumbers[0]!;
						updated = true;
					}
				}
			}
		}

		return updated;
	}

	public solve(): boolean {
		let progress = true;
		while (progress) {
			progress = false;

			for (const size of this.range) {
				progress ||= this.solveNakedGroups(size);

				if (progress)
					break;
			}
		}

		return progress;
	}

}


class SudokuHiddenGroup {

	private board: Board;
	private size: number;
	private blockSize: number;
	private range: number[];

	constructor(board: Board) {
		this.board = board;
		this.size = board.length;
		this.blockSize = Math.round(Math.sqrt(this.size));
		this.range = range(1, this.size);
	}

	private isValid(num: number, row: number, col: number): boolean {
		for (let i = 0; i < this.size; i++) {
			if (this.board[row]![i] === num || this.board[i]![col] === num)
				return false;
		}

		const blockRow = Math.floor(row / this.blockSize) * this.blockSize;
		const blockCol = Math.floor(col / this.blockSize) * this.blockSize;
		for (let i = 0; i < this.blockSize; i++) {
			for (let j = 0; j < this.blockSize; j++) {
				if (this.board[blockRow + i]![blockCol + j] === num)
					return false;
			}
		}

		return true;
	}

	private getAvailableNumbers(row: number, col: number): number[] {
		const availableNumbers = new Set<number>();
		for (let num = 1; num <= this.size; num++) {
			if (this.isValid(num, row, col))
				availableNumbers.add(num);
		}

		return Array.from(availableNumbers);
	}

	public solveHiddenGroups(groupSize: number): boolean {
		let updated = false;

		// Check rows
		for (let row = 0; row < this.size; row++) {
			const count: { [key: number]: number } = {};
			for (let col = 0; col < this.size; col++) {
				if (this.board[row]![col] === 0) {
					const availableNumbers = this.getAvailableNumbers(row, col);
					availableNumbers.forEach((num) => {
						count[num] = (count[num] || 0) + 1;
					});
				}
			}
			for (const num in count) {
				if (count[num] === groupSize) {
					for (let col = 0; col < this.size; col++) {
						if (this.board[row]![col] === 0 && this.isValid(parseInt(num), row, col)) {
							this.board[row]![col] = parseInt(num);
							updated = true;
						}
					}
				}
			}
		}

		// Check columns
		for (let col = 0; col < this.size; col++) {
			const count: { [key: number]: number } = {};
			for (let row = 0; row < this.size; row++) {
				if (this.board[row]![col] === 0) {
					const availableNumbers = this.getAvailableNumbers(row, col);
					availableNumbers.forEach((num) => {
						count[num] = (count[num] || 0) + 1;
					});
				}
			}
			for (const num in count) {
				if (count[num] === groupSize) {
					for (let row = 0; row < this.size; row++) {
						if (this.board[row]![col] === 0 && this.isValid(parseInt(num), row, col)) {
							this.board[row]![col] = parseInt(num);
							updated = true;
						}
					}
				}
			}
		}

		// Check blocks
		for (let blockRow = 0; blockRow < this.size; blockRow += this.blockSize) {
			for (let blockCol = 0; blockCol < this.size; blockCol += this.blockSize) {
				const count: { [key: number]: number } = {};
				for (let row = blockRow; row < blockRow + this.blockSize; row++) {
					for (let col = blockCol; col < blockCol + this.blockSize; col++) {
						if (this.board[row]![col] === 0) {
							const availableNumbers = this.getAvailableNumbers(row, col);
							availableNumbers.forEach((num) => {
								count[num] = (count[num] || 0) + 1;
							});
						}
					}
				}
				for (const num in count) {
					if (count[num] === groupSize) {
						for (let row = blockRow; row < blockRow + this.blockSize; row++) {
							for (let col = blockCol; col < blockCol + this.blockSize; col++) {
								if (this.board[row]![col] === 0 && this.isValid(parseInt(num), row, col)) {
									this.board[row]![col] = parseInt(num);
									updated = true;
								}
							}
						}
					}
				}
			}
		}

		return updated;
	}

	public solve(): boolean {
		let progress = true;
		while (progress) {
			progress = false;

			for (const size of this.range) {
				progress ||= this.solveHiddenGroups(size);

				if (progress)
					break;
			}
		}

		return progress;
	}

}


class SudokuSolver {

	private board: Board;
	private nakedGroupSolver: SudokuNakedGroup;
	private hiddenGroupSolver: SudokuHiddenGroup;

	constructor(board: Board) {
		this.board = clone(board);

		this.nakedGroupSolver = new SudokuNakedGroup(this.board);
		this.hiddenGroupSolver = new SudokuHiddenGroup(this.board);
	}

	public solve() {
		let progress = true;
		while (progress) {
			progress = false;

			progress ||= this.nakedGroupSolver.solve();
			progress ||= this.hiddenGroupSolver.solve();
		}

		return this.board;
	}

}


/**
 * Implements a backtracking algorithm to solve 9x9 sudokus.
 */
class SudokuBacktracker {

	private grid: number[][];
	private readonly size: number;
	private readonly boxSize: number;
	private iterations = 0;

	constructor(grid: number[][]) {
		// Clone the given array so we don't override the unsolved puzzle
		this.grid = clone(grid);
		this.size = this.grid.length;
		this.boxSize = Math.round(Math.sqrt(this.size));
	}

	public get sudoku() {
		return this.grid;
	}

	public get neededIterations() {
		return this.iterations;
	}

	/**
	 * Finds the first empty cell in this.grid and returns its coordinations in an
	 * array where the first entry represents the row (x) and the second entry the
	 * column (y).
	 */
	public findEmptyCell(): [number, number] {
		let coords: [number, number] = [ -1, -1 ];
		for (let x = 0; x < this.size; x++) {
			for (let y = 0; y < this.size; y++) {
				if (this.grid[x]![y] === 0) {
					coords[0] = x;
					coords[1] = y;

					return coords;
				}
			}
		}

		return coords;
	}

	/**
	* Checks if a number is allowed to be used in a given row.
	*/
	public usedInRow(row: number, number: number): boolean {
		for (let x = 0; x < this.size; x++) {
			if (this.grid[row]![x] === number)
				return true;
		}

		return false;
	}

	/**
	* Checks if a number is allowed in a given column.
	*/
	public usedInColumn(column: number, number: number): boolean {
		for (let y = 0; y < this.size; y++) {
			if (this.grid[y]![column] === number)
				return true;
		}

		return false;
	}

	/**
	* Checks if a number is allowed in a given square.
	*/
	public usedInSquare(row: number, column: number, number: number): boolean {
		row -= row % this.boxSize;
		column -= column % this.boxSize;

		for (let x = 0; x < this.boxSize; x++) {
			for (let y = 0; y < this.boxSize; y++) {
				if (this.grid[x + row]![y + column] === number)
					return true;
			}
		}

		return false;
	}

	/**
	* Checks if a given number can be placed in a row/column.
	*/
	public isLocationSafe(row: number, column: number, number: number): boolean {
		//console.log('safe location?:', {
		//	usedInColumn: this.usedInColumn(column, number),
		//	usedInRow:    this.usedInRow(row, number),
		//	usedInSquare: this.usedInSquare(row, column, number),
		//});

		return !this.usedInColumn(column, number)
			&& !this.usedInRow(row, number)
			&& !this.usedInSquare(row, column, number);
	}

	/**
	* Recursively solves the sudoku. Returns the solved sudoku grid
	* if possible, or false if there is no solution possible.
	*
	* Use `<number[][]>sudoku` to cast the output of this
	* method after you have made sure it is an array.
	*/
	public solve(): number[][] {
		this.iterations++;

		// Find the next empty cell
		let [ row, column ] = this.findEmptyCell();

		// If no empty cell was found then the sudoku has been solved
		if (row === -1 && column === -1)
			return this.grid;


		// Try numbers from 1 to this.size
		for (let number = 1; number <= this.size; number++) {
			// Make sure the location is safe for the current number
			if (this.isLocationSafe(row, column, number)) {
				// Seems good! Store the number in the grid
				this.grid[row]![column] = number;

				// Recursively try the next cell with numbers from 1 to 9
				// If it returns true, the sudoku has been solved
				if (this.solve())
					return this.grid;

				// Looks like we were wrong, revert back and try again
				this.grid[row]![column] = 0;
			}
		}

		return this.grid;
	}

}


const gridSmall = `
0 0 2 3 6 0 0 0 0
0 0 0 4 5 0 9 6 0
0 0 4 0 0 0 0 0 5
0 0 0 0 0 0 0 2 8
0 0 0 0 0 8 1 5 0
3 0 0 0 0 0 0 0 0
2 0 0 0 0 1 0 0 7
0 0 0 9 8 3 0 0 0
4 1 0 0 0 5 0 0 0
`.split('\n').filter(Boolean).map(r => r.split(' ').map(s => Number(s)));


const gridMedium = `
0 0 12 6 0 0 7 0 18 0 5 24 0 10 1 0 0 4 0 0 0 0 0 0 0
2 0 19 0 13 0 0 0 10 0 0 0 0 0 0 0 0 18 5 0 0 0 0 0 1
0 0 0 0 0 0 0 22 0 0 0 0 3 0 2 0 0 14 12 0 16 8 25 0 0
0 16 0 0 0 2 23 0 0 13 12 22 0 0 0 21 15 19 3 0 0 0 0 14 0
23 0 24 0 0 0 0 0 25 8 4 0 16 19 21 0 0 7 0 0 0 3 12 0 9
0 4 0 2 0 0 0 0 0 0 0 10 0 24 12 17 16 0 0 0 5 0 0 0 0
0 0 9 0 0 6 25 0 0 0 8 0 5 3 0 0 0 0 0 0 20 0 0 18 19
15 0 10 11 0 0 0 18 12 19 0 0 0 0 0 0 0 23 0 0 7 0 0 4 0
0 0 0 0 0 0 0 14 0 22 0 0 18 16 20 0 6 11 13 0 0 0 0 0 0
0 22 0 25 0 0 1 17 5 4 7 0 0 14 0 8 3 21 0 0 11 0 0 0 6
0 20 13 15 0 0 0 0 0 0 9 0 0 2 0 25 0 1 8 0 0 5 0 21 0
0 1 0 0 0 0 16 10 0 7 0 0 4 20 0 0 9 0 0 14 0 24 0 17 0
25 2 5 0 0 0 0 0 13 0 0 0 0 0 22 0 0 0 0 0 19 1 8 0 0
0 0 7 21 0 0 12 0 2 17 0 0 0 18 6 16 0 0 15 0 0 13 0 10 0
8 10 18 12 16 9 0 0 0 5 0 0 0 0 19 0 0 17 0 21 0 15 0 0 22
0 8 0 0 15 0 3 0 6 0 21 0 0 7 0 18 14 5 0 1 0 0 0 0 0
0 0 0 19 0 1 0 16 11 0 0 0 10 22 25 15 0 0 0 0 0 0 21 0 0
0 3 1 0 21 0 0 4 0 0 0 0 2 0 13 0 24 25 0 0 14 0 0 6 0
0 0 0 0 0 0 0 15 0 12 14 0 6 17 24 0 0 0 0 0 0 0 13 0 0
0 5 23 16 4 0 13 24 7 2 0 9 0 0 15 3 0 22 0 0 0 0 0 0 8
0 0 25 20 2 0 19 0 0 0 0 1 0 0 0 0 21 3 0 0 12 0 0 0 0
16 12 0 5 0 11 21 0 23 0 0 15 0 0 0 0 19 9 0 0 0 0 0 25 10
0 0 0 0 9 20 22 7 4 0 3 0 14 25 18 0 11 0 0 0 0 0 1 0 15
24 0 6 0 22 8 0 25 14 0 10 11 0 9 0 20 1 16 0 7 0 23 0 0 13
14 13 21 1 0 0 5 0 0 0 6 0 22 0 23 10 0 0 0 2 0 0 18 7 11
`.split('\n').filter(Boolean).map(r => r.split(' ').map(s => Number(s)));

let result = gridMedium;

console.log('is initially valid:', isValidSudoku(result));

let start;

//const solver = new SudokuSolver(gridSmall);

//start = performance.now();
//result = solver.solve();
//console.log('solver', performance.now() - start);
//console.log(result);

//console.log('is valid?', isValidSudoku(result));


const backtrackSolver = new SudokuBacktracker(gridSmall);

start = performance.now();
result = backtrackSolver.solve();
console.log('backtracker', performance.now() - start);
console.log('is valid:', isValidSudoku(result));
console.log(result);
