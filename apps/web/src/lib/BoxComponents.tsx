import type { BaseBoxState } from "./types";

interface BoxProps {
	box: BaseBoxState;
	isAnimating: boolean;
	clickedBoxes: number[];
	onBoxClick: (boxId: number) => void;
	className?: string;
}

export function Box({
	box,
	isAnimating,
	clickedBoxes,
	onBoxClick,
	className = "",
}: BoxProps) {
	const clickOrder = clickedBoxes.indexOf(box.id);
	const isClicked = clickOrder !== -1;

	return (
		<button
			type="button"
			className={`
				w-12 h-12 border-2 border-gray-300 cursor-pointer
				transition-colors duration-200 hover:opacity-80
				${box.isGreen ? "bg-green-500" : "bg-red-500"}
				${isAnimating ? "cursor-not-allowed" : ""}
				${className}
			`}
			onClick={() => onBoxClick(box.id)}
			title={`Box ${box.id + 1}${isClicked ? ` (clicked ${clickOrder + 1})` : ""}`}
		/>
	);
}

interface BoxInputProps {
	value: string;
	error: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	min: number;
	max: number;
	label: string;
	placeholder?: string;
}

export function BoxInput({
	value,
	error,
	onChange,
	min,
	max,
	label,
	placeholder,
}: BoxInputProps) {
	return (
		<div className="space-y-2">
			<label
				htmlFor="box-count"
				className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			>
				{label}
			</label>
			<input
				id="box-count"
				type="number"
				min={min}
				max={max}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				className={`
					flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
					${error ? "border-red-500" : ""}
				`}
			/>
			{error && <p className="text-sm text-red-500 mt-1">{error}</p>}
		</div>
	);
}

interface StatusDisplayProps {
	isAnimating: boolean;
	greenCount: number;
	totalCount: number;
	layoutType?: string;
}

export function StatusDisplay({
	isAnimating,
	greenCount,
	totalCount,
	layoutType,
}: StatusDisplayProps) {
	return (
		<div className="text-center text-sm text-muted-foreground">
			{isAnimating
				? "Reverting colors..."
				: `Click boxes to turn them green (${greenCount}/${totalCount})${layoutType ? ` - ${layoutType}` : ""}`}
		</div>
	);
}
