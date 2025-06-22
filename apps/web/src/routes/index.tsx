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
	clickOrder: number | null;
}

function HomeComponent() {
	const [n, setN] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [boxes, setBoxes] = useState<BoxState[]>([]);
	const [isAnimating, setIsAnimating] = useState(false);
	const [clickCount, setClickCount] = useState(0);
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
				clickOrder: null,
			}));
			setBoxes(newBoxes);
			setClickCount(0);
			setIsAnimating(false);
			// Clear any existing timeouts
			animationTimeouts.current.forEach((timeout) => clearTimeout(timeout));
			animationTimeouts.current = [];
		}
	};

	const handleBoxClick = useCallback(
		(boxId: number) => {
			if (isAnimating) return;

			setBoxes((prevBoxes) => {
				const updatedBoxes = prevBoxes.map((box) => {
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
								setBoxes((currentBoxes) =>
									currentBoxes.map((b) =>
										b.id === box.id
											? { ...b, isGreen: false, clickOrder: null }
											: b,
									),
								);

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

				return updatedBoxes;
			});
		},
		[clickCount, isAnimating],
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
									type="submit"
										key={box.id}
										className={`
                      w-12 h-12 border-2 border-gray-300 cursor-pointer
                      transition-colors duration-200 hover:opacity-80
                      ${box.isGreen ? "bg-green-500" : "bg-red-500"}
                      ${isAnimating ? "cursor-not-allowed" : ""}
                    `}
										onClick={() => handleBoxClick(box.id)}
										title={`Box ${box.id + 1}${box.clickOrder !== null ? ` (clicked ${box.clickOrder + 1})` : ""}`}
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
