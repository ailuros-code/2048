let cellId = 0;

export class Cell {
	x: number = 0;
	y: number = 0;
	value: number = 0;
	id: number = 0;
	fusedWith: number = -1;
	phantom: boolean = false;

	constructor(x: number, y: number, value: number, id: number | undefined = undefined, phantom: boolean = false) {
		this.x = x;
		this.y = y;
		this.value = value;
		this.id = id ?? cellId++;
		this.phantom = phantom;
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