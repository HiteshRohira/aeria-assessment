import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, BoxInput, StatusDisplay } from "@/lib/BoxComponents";
import type { BaseBoxState } from "@/lib/types";
import { useBoxAnimation } from "@/lib/useBoxAnimation";
import { useNumberInput } from "@/lib/useNumberInput";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	const [boxes, setBoxes] = useState<BaseBoxState[]>([]);

	const numberInput = useNumberInput({
		min: 5,
		max: 25,
		errorMessage: "Number must be between 5 and 25 (inclusive)",
	});

	const { clickedBoxes, isAnimating, handleBoxClick, resetAnimation } =
		useBoxAnimation({
			boxes,
			setBoxes,
		});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		numberInput.handleChange(e);

		const value = e.target.value;
		if (value === "") {
			setBoxes([]);
			return;
		}

		// Validate current input directly instead of relying on async state
		const num = Number.parseInt(value);
		if (!Number.isNaN(num) && num >= 5 && num <= 25) {
			const numBoxes = num;
			const newBoxes: BaseBoxState[] = Array.from(
				{ length: numBoxes },
				(_, i) => ({
					id: i,
					isGreen: false,
				}),
			);
			setBoxes(newBoxes);
			resetAnimation();
		}
	};

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">
						Interactive Box Display
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

					{boxes.length > 0 && (
						<div className="space-y-4">
							<StatusDisplay
								isAnimating={isAnimating}
								greenCount={boxes.filter((b) => b.isGreen).length}
								totalCount={boxes.length}
							/>

							<div className="flex flex-wrap gap-2 justify-center">
								{boxes.map((box) => (
									<Box
										key={box.id}
										box={box}
										isAnimating={isAnimating}
										clickedBoxes={clickedBoxes}
										onBoxClick={handleBoxClick}
									/>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
