import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/bonus")({
	component: BonusComponent,
});

interface BoxState {
	id: number;
	isGreen: boolean;
	clickOrder: number | null;
	row: number;
	col: number;
}

interface CShapeLayout {
	boxes: BoxState[];
	rows: number;
	cols: number;
}

function BonusComponent() {
	const [n, setN] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [layout, setLayout] = useState<CShapeLayout | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const [clickCount, setClickCount] = useState(0);
	const animationTimeouts = useRef<NodeJS.Timeout[]>([]);

	const generateCShapeLayout = (numBoxes: number): CShapeLayout => {
		const boxes: BoxState[] = [];
		let boxId = 0;

		// Calculate dimensions for C shape
		// For a C shape, we need at least 3 rows and the middle section should be about 1/3 of total
		// const totalRows = Math.max(3, Math.ceil(numBoxes / 3));
		// const topBottomSize = Math.floor((numBoxes - Math.max(1, Math.floor(totalRows / 3))) / 2);
		// const middleSize = numBoxes - (topBottomSize * 2);

		// Adjust for better C shape
		let topSize: number
		let bottomSize: number
		let leftSize: number

		if (numBoxes <= 8) {
			// For smaller numbers, use simpler distribution
			topSize = Math.ceil(numBoxes / 3);
			bottomSize = Math.ceil(numBoxes / 3);
			leftSize = numBoxes - topSize - bottomSize;
		} else {
			// For larger numbers, ensure good C shape
			const sideSize = Math.floor(numBoxes / 3);
			topSize = sideSize;
			bottomSize = sideSize;
			leftSize = numBoxes - topSize - bottomSize;
		}

		const maxCols = Math.max(topSize, bottomSize);
		const totalRowsNeeded = leftSize + 2; // +2 for top and bottom rows

		// Top row
		for (let col = 0; col < topSize; col++) {
			boxes.push({
				id: boxId++,
				isGreen: false,
				clickOrder: null,
				row: 0,
				col: col,
			});
		}

		// Middle left column (excluding top and bottom positions)
		for (let row = 1; row < totalRowsNeeded - 1; row++) {
			if (boxId < numBoxes) {
				boxes.push({
					id: boxId++,
					isGreen: false,
					clickOrder: null,
					row: row,
					col: 0,
				});
			}
		}

		// Bottom row
		for (let col = 0; col < bottomSize && boxId < numBoxes; col++) {
			boxes.push({
				id: boxId++,
				isGreen: false,
				clickOrder: null,
				row: totalRowsNeeded - 1,
				col: col,
			});
		}

		return {
			boxes,
			rows: totalRowsNeeded,
			cols: maxCols,
		};
	};

	const validateInput = (value: string): boolean => {
		const num = Number.parseInt(value);
		if (Number.isNaN(num)) {
			setError("Please enter a valid number");
			return false;
		}
		if (num < 5 || num > 25) {
			setError("Number must be between 5 and 25 (inclusive)");
			return false;
		}
		setError("");
		return true;
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setN(value);

		if (value === "") {
			setError("");
			setLayout(null);
			return;
		}

		if (validateInput(value)) {
			const numBoxes = Number.parseInt(value);
			const newLayout = generateCShapeLayout(numBoxes);
			setLayout(newLayout);
			setClickCount(0);
			setIsAnimating(false);
			// Clear any existing timeouts
			animationTimeouts.current.forEach((timeout) => clearTimeout(timeout));
			animationTimeouts.current = [];
		}
	};

	const handleBoxClick = useCallback(
		(boxId: number) => {
			if (isAnimating || !layout) return;

			setLayout((prevLayout) => {
				if (!prevLayout) return prevLayout;

				const updatedBoxes = prevLayout.boxes.map((box) => {
					if (box.id === boxId && !box.isGreen) {
						return { ...box, isGreen: true, clickOrder: clickCount };
					}
					return box;
				});

				const newClickCount = clickCount + 1;
				setClickCount(newClickCount);

				// Check if all boxes are green
				const allGreen = updatedBoxes.every((box) => box.isGreen);
				if (allGreen) {
					setIsAnimating(true);
					// Sort boxes by click order (descending) to revert in reverse order
					const sortedBoxes = [...updatedBoxes].sort(
						(a, b) => (b.clickOrder || 0) - (a.clickOrder || 0),
					);

					sortedBoxes.forEach((box, index) => {
						const timeout = setTimeout(
							() => {
								setLayout((currentLayout) => {
									if (!currentLayout) return currentLayout;
									return {
										...currentLayout,
										boxes: currentLayout.boxes.map((b) =>
											b.id === box.id
												? { ...b, isGreen: false, clickOrder: null }
												: b,
										),
									};
								});

								// If this is the last box to revert, reset the animation state
								if (index === sortedBoxes.length - 1) {
									setIsAnimating(false);
									setClickCount(0);
								}
							},
							(index + 1) * 1000,
						);

						animationTimeouts.current.push(timeout);
					});
				}

				return {
					...prevLayout,
					boxes: updatedBoxes,
				};
			});
		},
		[clickCount, isAnimating, layout],
	);

	// Cleanup timeouts on unmount
	useEffect(() => {
		return () => {
			animationTimeouts.current.forEach((timeout) => clearTimeout(timeout));
		};
	}, []);

	const renderCShapeGrid = () => {
		if (!layout) return null;

		const grid: (BoxState | null)[][] = Array(layout.rows)
			.fill(null)
			.map(() => Array(layout.cols).fill(null));

		// Place boxes in grid
		layout.boxes.forEach((box) => {
			if (grid[box.row] && box.col < layout.cols) {
				grid[box.row][box.col] = box;
			}
		});

		return (
			<div className="inline-block">
				{grid.map((row, rowIndex) => (
					<div key={rowIndex} className="flex gap-2 mb-2">
						{row.map((box, colIndex) => (
							<div key={`${rowIndex}-${colIndex}`} className="relative">
								{box ? (
									<button
									  type="button"
										className={`
                      w-12 h-12 border-2 border-gray-300 cursor-pointer
                      transition-colors duration-200 hover:opacity-80
                      ${box.isGreen ? "bg-green-500" : "bg-red-500"}
                      ${isAnimating ? "cursor-not-allowed" : ""}
                    `}
										onClick={() => handleBoxClick(box.id)}
										title={`Box ${box.id + 1}${box.clickOrder !== null ? ` (clicked ${box.clickOrder + 1})` : ""}`}
									/>
								) : (
									<div className="w-12 h-12" /> // Empty space placeholder
								)}
							</div>
						))}
					</div>
				))}
			</div>
		);
	};

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">
						Bonus: C-Shape Box Arrangement
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="box-count">Enter number of boxes (5-25):</Label>
						<Input
							id="box-count"
							type="number"
							min="5"
							max="25"
							value={n}
							onChange={handleInputChange}
							placeholder="Enter a number between 5 and 25"
							className={error ? "border-red-500" : ""}
						/>
						{error && <p className="text-sm text-red-500 mt-1">{error}</p>}
					</div>

					{layout && (
						<div className="space-y-4">
							<div className="text-center text-sm text-muted-foreground">
								{isAnimating
									? "Reverting colors..."
									: `Click boxes to turn them green (${layout.boxes.filter((b) => b.isGreen).length}/${layout.boxes.length}) - C-Shape Layout`}
							</div>

							<div className="flex justify-center">{renderCShapeGrid()}</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
