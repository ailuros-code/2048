"use client";
import React, {useCallback, useEffect, useRef, useState} from "react";
import styles from "@/app/styles.module.css";

var cellId = 0;

class Cell {
	x: number = 0;
	y: number = 0;
	value: number = 0;
	id: number = 0;

	constructor(x: number, y: number, value: number, id: number | undefined = undefined) {
		this.x = x;
		this.y = y;
		this.value = value;
		this.id = id ?? cellId++;
	}

	equals(cell1: Cell) {
		return this.x === cell1.x && this.y === cell1.y && this.value === cell1.value;
	}

	static comparingById(a: Cell, b: Cell) {
		return a.id - b.id;
	}

	copy(): Cell {
		return new Cell(this.x, this.y, this.value, this.id);
	}
}

function PositionTemplate(props: {
	positionCellContainerRef: React.MutableRefObject<HTMLDivElement | null>,
	size: number,
}) {
	return <div className={styles.container} ref={props.positionCellContainerRef}>
		{
			Array(props.size * props.size).fill(0).map((_, i) => <div key={i} className={styles.boardItem}>{i}</div>)
		}
	</div>;
}

function VisualCell(props: { cell: Cell }) {
	return <div className={styles.cell}>
		<div>
			{props.cell.value}
		</div>
	</div>;
}

function VisualCells(props: {
	size: number,
	visualCellContainerRef: React.MutableRefObject<HTMLDivElement | null>,
	positionCellContainerRef: React.MutableRefObject<HTMLDivElement | null>,
	cells: Array<Cell>,
}) {

	const updateCellPositions = useCallback(() => {
		if (!props.positionCellContainerRef.current) return
		for (const cell of props.cells) {
			const positionElement = props.positionCellContainerRef.current?.children[cell.y * props.size + cell.x];
			const visualElement = props.visualCellContainerRef.current?.children[props.cells.indexOf(cell)]!! as HTMLDivElement;
			if (positionElement) {
				const {x, y, width, height} = positionElement.getBoundingClientRect();
				visualElement.style.left = x + "px";
				visualElement.style.top = y + "px";
				visualElement.style.width = width + "px";
				visualElement.style.height = height + "px";
			}
		}
	}, [props.cells, props.positionCellContainerRef, props.visualCellContainerRef, props.size])


	useEffect(() => {
		const observer = new ResizeObserver(() => {
			updateCellPositions();
		});
		if (props.positionCellContainerRef.current) observer.observe(props.positionCellContainerRef.current);
		if (props.visualCellContainerRef.current) observer.observe(props.visualCellContainerRef.current);
		observer.observe(document.body);
		updateCellPositions();
		return () => observer.disconnect();
	}, [updateCellPositions, props.positionCellContainerRef, props.visualCellContainerRef, props.cells, props.size]);

	return <div className={styles.cellContainer} ref={props.visualCellContainerRef}>{
		props.cells.map((cell) => (
			<VisualCell key={cell.id} cell={cell}/>
		))
	}</div>;
}

export default function Home() {
	const [size, _] = useState(4)
	const [cells, setCells] = useState<Array<Cell>>([
		new Cell(0, 1, 2),
		new Cell(0, 3, 2),
	]);
	const positionContainerRef = useRef<HTMLDivElement | null>(null);
	const cellContainerRef = useRef<HTMLDivElement | null>(null);

	function moveMerge(inCells: Array<Cell>): Array<Cell> {
		// Move cells to the start of the array, merging if values are equal.
		let outCells = []
		let alreadyMerged = true;
		for (const cell of inCells) {
			if (!alreadyMerged && outCells[outCells.length - 1].value === cell.value) {
				outCells[outCells.length - 1].value *= 2;
				alreadyMerged = true;
			} else {
				outCells.push(cell);
				alreadyMerged = false;
			}
		}
		return outCells;
	}

	function moveVertical(tempCells: Array<Cell>, up: boolean): Array<Cell> {
		// Move as far up as possible, with collisions
		// 1. Split cells by column and sort by y
		let columns = Array(size).fill(0)
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
				cell.y = up ? y : size - 1 - y;
				cell.x = x;
			});
		});
		return columns.flat();
	}

	function moveHorizontal(tempCells: Array<Cell>, left: boolean): Array<Cell> {
		// Move as far up as possible, with collisions
		// 1. Split cells by column and sort by y
		let rows = Array(size).fill(0)
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
				cell.x = left ? x : size - 1 - x;
				cell.y = y;
			});
		});
		// setCells(rows.flat());
		return rows.flat()
	}

	function spawn(tempCells: Array<Cell>): Array<Cell> {
		let emptySpaces = size * size - cells.length;
		// Ensure we dont try to spawn more cells than there are empty spaces
		let n = Math.floor(Math.random() * 2) + 1;
		if (n > emptySpaces) n = emptySpaces;
		// Ensure that the new cell is not in the same position as an existing cell
		for (let i = 0; i < n; i++) {
			let x = Math.floor(Math.random() * size);
			let y = Math.floor(Math.random() * size);
			while (tempCells.some(cell => cell.x === x && cell.y === y)) {
				x = Math.floor(Math.random() * size);
				y = Math.floor(Math.random() * size);
			}
			tempCells.push(new Cell(x, y, 2));
		}
		return tempCells
	}

	function handleKey(event: React.KeyboardEvent<HTMLDivElement>) {
		if (event.repeat) return
		// console.log(event.key, event.repeat)
		let moveFun = (c: Array<Cell>) => c;
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
			default:
				return;
		}
		let sortedOriginal = cells.toSorted(Cell.comparingById);
		let tempCells = moveFun(sortedOriginal.map(it=>it.copy())).toSorted(Cell.comparingById);
		// Check if changed
		let changed = tempCells.length != cells.length || tempCells.some((cell, i) => !cell.equals(sortedOriginal[i]));
		console.log(changed, tempCells.length != cells.length)
		if (changed) {
			tempCells = spawn(tempCells);
			setCells(tempCells);
		}

	}

	return (
		<div className={styles.main} onKeyDown={handleKey} tabIndex={1} autoFocus={true}>
			<PositionTemplate positionCellContainerRef={positionContainerRef} size={size}/>
			<VisualCells
				visualCellContainerRef={cellContainerRef}
				positionCellContainerRef={positionContainerRef}
				cells={cells}
				size={size}
			/>
		</div>
	);
}
