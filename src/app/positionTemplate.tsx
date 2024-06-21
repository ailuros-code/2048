import React from "react";
import styles from "@/app/styles.module.css";

export function PositionTemplate(props: {
	positionCellContainerRef: React.MutableRefObject<HTMLDivElement | null>,
	onKeyDown: React.KeyboardEventHandler<HTMLDivElement>
	size: number,
}) {
	return <div tabIndex={1} autoFocus={true} onKeyDown={props.onKeyDown} className={styles.container} style={{gridTemplateColumns: Array(props.size).fill(0).map(_=>["1fr"]).join(" ")}} ref={props.positionCellContainerRef}>
		{
			Array(props.size * props.size).fill(0).map((_, i) => <div key={i} className={styles.boardItem}>{i}</div>)
		}
	</div>;
}