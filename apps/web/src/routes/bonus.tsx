import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, BoxInput, StatusDisplay } from "@/lib/BoxComponents";
import type { GridBoxState } from "@/lib/types";
import { useBoxAnimation } from "@/lib/useBoxAnimation";
import { useNumberInput } from "@/lib/useNumberInput";

export const Route = createFileRoute("/bonus")({
	component: BonusComponent,
});

interface CShapeLayout {
	boxes: GridBoxState[];
	rows: number;
	cols: number;
}

function BonusComponent() {
	const [layout, setLayout] = useState<CShapeLayout | null>(null);

	const numberInput = useNumberInput({
		min: 5,
		max: 25,
		errorMessage: "Number must be between 5 and 25 (inclusive)",
	});

	const { clickedBoxes, isAnimating, handleBoxClick, resetAnimation } =
		useBoxAnimation({
			boxes: layout?.boxes || [],
			setBoxes: (updater) => {
				setLayout((prevLayout) => {
					if (!prevLayout) return prevLayout;
					return {
						...prevLayout,
						boxes: updater(prevLayout.boxes),
					};
				});
			},
		});

	const generateCShapeLayout = (numBoxes: number): CShapeLayout => {
		const boxes: GridBoxState[] = [];
		let boxId = 0;

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

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		numberInput.handleChange(e);

		const value = e.target.value;
		if (value === "") {
			setLayout(null);
			return;
		}

		// Validate current input directly instead of relying on async state
		const num = Number.parseInt(value);
		if (!Number.isNaN(num) && num >= 5 && num <= 25) {
			const numBoxes = num;
			const newLayout = generateCShapeLayout(numBoxes);
			setLayout(newLayout);
			resetAnimation();
		}
	};



	const renderCShapeGrid = () => {
		if (!layout) return null;

		const grid: (GridBoxState | null)[][] = Array(layout.rows)
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
									<Box
										box={box}
										isAnimating={isAnimating}
										clickedBoxes={clickedBoxes}
										onBoxClick={handleBoxClick}
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
					<BoxInput
						value={numberInput.value}
						error={numberInput.error}
						onChange={handleInputChange}
						min={5}
						max={25}
						label="Enter number of boxes (5-25):"
						placeholder="Enter a number between 5 and 25"
					/>

					{layout && (
						<div className="space-y-4">
							<StatusDisplay
								isAnimating={isAnimating}
								greenCount={layout.boxes.filter((b) => b.isGreen).length}
								totalCount={layout.boxes.length}
								layoutType="C-Shape Layout"
							/>

							<div className="flex justify-center">{renderCShapeGrid()}</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
