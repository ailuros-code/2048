"use client";
import React, {useState} from "react";
import styles from "@/app/styles.module.css";
import {GameUI} from "@/app/gameUI";


export default function Home() {
	const [size, setSize] = useState(4)

	function updateSize(event: React.ChangeEvent<HTMLInputElement>) {
		setSize(parseInt(event.target.value, 10))
	}

	return (
		<div className={styles.main}>
			<div className={styles.controls}>
				<div>
					<span>Size: </span>
					<input type="range" min="2" max="10" value={size} onChange={updateSize}/>
					<span>{size}</span>
				</div>
			</div>
			<GameUI size={size}/>
		</div>
	);
}
