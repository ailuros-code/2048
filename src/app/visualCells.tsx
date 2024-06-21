import React, {useCallback, useEffect} from "react";
import styles from "@/app/styles.module.css";
import {Cell} from "@/app/cell";
import {VisualCell} from "@/app/visualCell";

export function VisualCells(props: {
	size: number,
	visualCellContainerRef: React.MutableRefObject<HTMLDivElement | null>,
	positionCellContainerRef: React.MutableRefObject<HTMLDivElement | null>,
	cells: Array<Cell>,
}) {
	let ids = props.cells.map(cell => [cell.id, cell.fusedWith]).flat().filter(it => it != -1).sort();
	let idCellMap = ids
		.map((cellId): [number, Cell] => [cellId, props.cells.filter(it => it.id == cellId || it.fusedWith == cellId)[0]]);

	const updateCellPositions = useCallback(() => {
		if (!props.positionCellContainerRef.current) return
		for (const [cellId, cell] of idCellMap) {
			const positionElement = props.positionCellContainerRef.current?.children[cell.y * props.size + cell.x];
			const visualElement = props.visualCellContainerRef.current?.children[ids.indexOf(cellId)]!! as HTMLDivElement;
			if (positionElement) {
				const {x, y, width, height} = positionElement.getBoundingClientRect();
				visualElement.style.left = x + "px";
				visualElement.style.top = y + "px";
				visualElement.style.width = width + "px";
				visualElement.style.height = height + "px";
			}
		}
	}, [props.cells, props.positionCellContainerRef, props.visualCellContainerRef, props.size, ids, idCellMap])


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
		idCellMap
			.map(([cellId, cell]) => <VisualCell key={cellId} cell={new Cell(cell.x, cell.y, cell.value, cellId, cell.id == cellId)}/>)
	}</div>;
}