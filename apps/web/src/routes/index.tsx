import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

interface BoxState {
	id: number;
	isGreen: boolean;
}

function HomeComponent() {
	const [n, setN] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [boxes, setBoxes] = useState<BoxState[]>([]);
	const [clickedBoxes, setClickedBoxes] = useState<number[]>([]);
	const [isAnimating, setIsAnimating] = useState(false);
	const animationTimeouts = useRef<NodeJS.Timeout[]>([]);

	const validateInput = (value: string): boolean => {
		const num = Number.parseInt(value);
		if (isNaN(num)) {
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
			setBoxes([]);
			return;
		}

		if (validateInput(value)) {
			const numBoxes = Number.parseInt(value);
			const newBoxes: BoxState[] = Array.from({ length: numBoxes }, (_, i) => ({
				id: i,
				isGreen: false,
			}));
			setBoxes(newBoxes);
			setClickedBoxes([]);
			setIsAnimating(false);
			// Clear any existing timeouts
			animationTimeouts.current.forEach((timeout) => clearTimeout(timeout));
			animationTimeouts.current = [];
		}
	};

	const handleBoxClick = useCallback(
		(boxId: number) => {
			if (isAnimating) return;

			// Check if box is already green
			const box = boxes.find((b) => b.id === boxId);
			if (!box || box.isGreen) return;

			// Update boxes to green
			setBoxes((prevBoxes) =>
				prevBoxes.map((b) =>
					b.id === boxId ? { ...b, isGreen: true } : b,
				),
			);

			// Add to clicked boxes stack
			const newClickedBoxes = [...clickedBoxes, boxId];
			setClickedBoxes(newClickedBoxes);

			// Check if all boxes are green
			const allGreen = boxes.every((b) => b.id === boxId || b.isGreen);
			if (allGreen) {
				setIsAnimating(true);

				// Revert boxes in reverse order (LIFO)
				newClickedBoxes.reverse().forEach((clickedBoxId, index) => {
					const timeout = setTimeout(
						() => {
							setBoxes((currentBoxes) =>
								currentBoxes.map((b) =>
									b.id === clickedBoxId ? { ...b, isGreen: false } : b,
								),
							);

							// If this is the last box to revert, reset the animation state
							if (index === newClickedBoxes.length - 1) {
								setIsAnimating(false);
								setClickedBoxes([]);
							}
						},
						(index + 1) * 1000,
					);

					animationTimeouts.current.push(timeout);
				});
			}
		},
		[boxes, clickedBoxes, isAnimating],
	);

	// Cleanup timeouts on unmount
	useEffect(() => {
		return () => {
			animationTimeouts.current.forEach((timeout) => clearTimeout(timeout));
		};
	}, []);

	return (
		<div className="container mx-auto max-w-4xl px-4 py-8">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">
						Interactive Box Display
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

					{boxes.length > 0 && (
						<div className="space-y-4">
							<div className="text-center text-sm text-muted-foreground">
								{isAnimating
									? "Reverting colors..."
									: `Click boxes to turn them green (${boxes.filter((b) => b.isGreen).length}/${boxes.length})`}
							</div>

							<div className="flex flex-wrap gap-2 justify-center">
								{boxes.map((box) => (
									<button
										type="button"
										key={box.id}
										className={`
                      w-12 h-12 border-2 border-gray-300 cursor-pointer
                      transition-colors duration-200 hover:opacity-80
                      ${box.isGreen ? "bg-green-500" : "bg-red-500"}
                      ${isAnimating ? "cursor-not-allowed" : ""}
                    `}
										onClick={() => handleBoxClick(box.id)}
										title={`Box ${box.id + 1}${clickedBoxes.includes(box.id) ? ` (clicked ${clickedBoxes.indexOf(box.id) + 1})` : ""}`}
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
