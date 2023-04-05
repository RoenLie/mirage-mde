export type Range = {
	from: number;
	to: number;
};


export const  isRangeInRanges = (ranges: Range[], targetRange: Range): boolean => {
	for (const range of ranges) {
		for (let number = range.from; number <= range.to; number++) {
			if (number >= targetRange.from && number <= targetRange.to)
				return true;
		}
	}

	return false;
};
