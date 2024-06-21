import {Cell} from "@/app/cell";
import styles from "@/app/styles.module.css";
import React, {useEffect, useState} from "react";

export function VisualCell(props: { cell: Cell }) {
	// border: 3px solid #aa005555;background: #ff0000aa;
	let [fontSize, setFontSize] = useState(0 + "em");

	useEffect(() => {
		setFontSize(Math.max(0.5, 0.5 + 4 / Math.log(props.cell.value * 4)) + "em")
	}, [props.cell.value]);

	const lerpPoints = [
		{r: 255, g: 0, b: 0, a: 170,},
		{r: 255, g: 255, b: 0, a: 170,},
		{r: 0, g: 255, b: 0, a: 170,},
		{r: 0, g: 255, b: 255, a: 170,},
		{r: 0, g: 0, b: 255, a: 170,},
		{r: 255, g: 0, b: 255, a: 170,},
		{r: 255, g: 255, b: 255, a: 170,},
		{r: 0, g: 0, b: 0, a: 170,},
	]
	const width = 5;
	const cidx = Math.log2(props.cell.value) - 1
	const colorStart = lerpPoints[Math.min(Math.floor(cidx / width), lerpPoints.length - 1)];
	const colorEnd = lerpPoints[Math.min(Math.ceil(cidx / width), lerpPoints.length - 1)];
	if (colorStart == undefined || colorEnd == undefined) {
		console.error(cidx)
		return
	}
	let color = {
		r: colorStart.r + (colorEnd.r - colorStart.r) * ((cidx - 1) % width) / width,
		g: colorStart.g + (colorEnd.g - colorStart.g) * ((cidx - 1) % width) / width,
		b: colorStart.b + (colorEnd.b - colorStart.b) * ((cidx - 1) % width) / width,
		a: colorStart.a + (colorEnd.a - colorStart.a) * ((cidx - 1) % width) / width,
	}
	let border = "3px solid #" + [
		Math.floor(0.5 * color.r).toString(16).padStart(2, "0"),
		Math.floor(0.5 * color.g).toString(16).padStart(2, "0"),
		Math.floor(0.5 * color.b).toString(16).padStart(2, "0"),
		Math.floor(0.5 * color.a).toString(16).padStart(2, "0")
	].join("");
	let background = "#" + [
		Math.floor(color.r).toString(16).padStart(2, "0"),
		Math.floor(color.g).toString(16).padStart(2, "0"),
		Math.floor(color.b).toString(16).padStart(2, "0"),
		Math.floor(color.a).toString(16).padStart(2, "0")
	].join("");
	return <div className={styles.cell}>
		<div style={{
			border: border,
			background: background,
			fontSize: fontSize,
			filter: `drop-shadow(4px 4px 2px #000000aa) opacity(${props.cell.phantom ? 1 : 0})`
		}}>
			{props.cell.value}
		</div>
	</div>;
}