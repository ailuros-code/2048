import React, {useRef, useState} from "react";
import {Cell} from "@/app/cell";
import {PositionTemplate} from "@/app/positionTemplate";
import {VisualCells} from "@/app/visualCells";

export function GameUI(props: {
	size: number,
}) {
	const [cells, setCells] = useState<Cell[]>([
		new Cell(0, 0, 2),
	]);
	const positionCellContainerRef = useRef<HTMLDivElement | null>(null);
	const visualCellContainerRef = useRef<HTMLDivElement | null>(null);

	function moveMerge(inCells: Cell[]): Cell[] {
		// Move cells to the start of the array, merging if values are equal.
		let outCells = []
		let alreadyMerged = true;
		for (const cell of inCells) {
			if (!alreadyMerged && outCells[outCells.length - 1].value === cell.value) {
				outCells[outCells.length - 1].value *= 2
				outCells[outCells.length - 1].fusedWith = cell.id
				cell.fusedWith = outCells[outCells.length - 1].id
				cell.value *= 2
				outCells[outCells.length - 1] = cell
				alreadyMerged = true;
			} else {
				outCells.push(cell);
				alreadyMerged = false;
			}
		}
		return outCells;
	}

	function moveVertical(tempCells: Cell[], up: boolean): Cell[] {
		// Move as far up as possible, with collisions
		// 1. Split cells by column and sort by y
		let columns = Array(props.size).fill(0)
			.map((_, i) =>
				tempCells
					.filter(cell => cell.x === i)
					.sort((a, b) => up ? (a.y - b.y) : (b.y - a.y))
			);
		// 2. For each column, move cells upwards, merging if possible
		columns = columns.map(moveMerge);
		// 3. Assign new y values
		columns.forEach((column, x) => {
			column.forEach((cell, y) => {
				cell.y = up ? y : props.size - 1 - y;
				cell.x = x;
			});
		});
		return columns.flat();
	}

	function moveHorizontal(tempCells: Cell[], left: boolean): Cell[] {
		// Move as far up as possible, with collisions
		// 1. Split cells by column and sort by y
		let rows = Array(props.size).fill(0)
			.map((_, i) =>
				tempCells
					.filter(cell => cell.y === i)
					.sort((a, b) => left ? (a.x - b.x) : (b.x - a.x))
			);
		// 2. For each column, move cells upwards, merging if possible
		rows = rows.map(moveMerge);
		// 3. Assign new y values
		rows.forEach((row, y) => {
			row.forEach((cell, x) => {
				cell.x = left ? x : props.size - 1 - x;
				cell.y = y;
			});
		});
		// setCells(rows.flat());
		return rows.flat()
	}

	function spawn(tempCells: Cell[]): Cell[] {
		let emptySpaces = props.size * props.size - cells.length;
		// Ensure we dont try to spawn more cells than there are empty spaces
		let n = Math.floor(Math.random() * props.size * 0.25) + 1;
		if (n > emptySpaces) n = emptySpaces;
		let freeSpaces = Array(props.size * props.size).fill(0).map((_, i) => i).filter(i => !tempCells.some(cell => cell.x + cell.y * props.size === i));
		// Ensure that the new cell is not in the same position as an existing cell
		for (let i = 0; i < n; i++) {
			let index = freeSpaces[Math.floor(Math.random() * freeSpaces.length)];
			let x = index % props.size;
			let y = Math.floor(index / props.size);
			// Spawn 2 4 or 8
			const gameLevel = Math.log2(cells.map(c => c.value).reduce((a, b) => Math.min(a, b), 0));
			const value = Math.round(2 ** (([1, 2, 3][Math.floor(Math.random() * 3)])));
			tempCells.push(new Cell(x, y, value));
		}
		return tempCells
	}

	function hasChanged(before: Cell[], after: Cell[]): boolean {
		let sortedOriginal = before.toSorted(Cell.comparingById);
		let sortedNew = after.toSorted(Cell.comparingById);
		return sortedNew.length != sortedOriginal.length || sortedNew.some((cell, i) => !cell.equals(sortedOriginal[i]));

	}

	function doMove(moveFun: (c: Cell[]) => Cell[], inCells: Cell[]): [boolean, Cell[]] {
		// Check if changed
		let tempCells = moveFun(inCells.map(c => c.copy()));
		let changed = hasChanged(inCells, tempCells);
		if (changed) tempCells = spawn(tempCells);
		return [changed, tempCells];
	}

	function shuffle<T>(directions: T[]) {
		return directions
			.map(value => ({value, sort: Math.random()}))
			.sort((a, b) => a.sort - b.sort)
			.map(({value}) => value);
	}

	function handleKey(event: React.KeyboardEvent<HTMLDivElement>) {
		// if (event.repeat) return
		// console.log(event.key, event.repeat)
		let moveFun = (c: Cell[]) => c;
		switch (event.key) {
			case "ArrowUp":
				moveFun = c => moveVertical(c, true)
				break;
			case "ArrowDown":
				moveFun = c => moveVertical(c, false);
				break;
			case "ArrowLeft":
				moveFun = c => moveHorizontal(c, true);
				break;
			case "ArrowRight":
				moveFun = c => moveHorizontal(c, false);
				break;
			case " ":
				let tempCells = cells
				let changed = false
				for (let i = 0; i < 1; i++) {
					for (let key of shuffle<(c: Cell[]) => Cell[]>([
						c => moveVertical(c, true),
						c => moveVertical(c, false),
						c => moveHorizontal(c, true),
						c => moveHorizontal(c, false)
					])) {
						[changed, tempCells] = doMove(key, tempCells);
						if (changed) break;
					}
				}
				setCells(tempCells)
				return false;
			default:
				return false;
		}
		let [changed, tempCells] = doMove(moveFun, cells);
		if (changed) setCells(tempCells);
	}

	return <>
		<PositionTemplate onKeyDown={handleKey} positionCellContainerRef={positionCellContainerRef} size={props.size}/>
		<VisualCells
			visualCellContainerRef={visualCellContainerRef}
			positionCellContainerRef={positionCellContainerRef}
			cells={cells}
			size={props.size}
		/>
	</>;
}