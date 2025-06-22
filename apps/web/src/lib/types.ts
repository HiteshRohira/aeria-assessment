export interface BaseBoxState {
	id: number;
	isGreen: boolean;
}

export interface GridBoxState extends BaseBoxState {
	row: number;
	col: number;
}
