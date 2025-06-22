import { useCallback, useState } from "react";
import type { BaseBoxState } from "./types";
import { useAnimationTimeouts } from "./useAnimationTimeouts";

interface UseBoxAnimationOptions<T extends BaseBoxState> {
	boxes: T[];
	setBoxes: (updater: (prev: T[]) => T[]) => void;
	animationDelay?: number;
}

interface UseBoxAnimationReturn {
	clickedBoxes: number[];
	isAnimating: boolean;
	handleBoxClick: (boxId: number) => void;
	resetAnimation: () => void;
}

export function useBoxAnimation<T extends BaseBoxState>({
	boxes,
	setBoxes,
	animationDelay = 1000,
}: UseBoxAnimationOptions<T>): UseBoxAnimationReturn {
	const [clickedBoxes, setClickedBoxes] = useState<number[]>([]);
	const [isAnimating, setIsAnimating] = useState(false);
	const { addTimeout, clearAllTimeouts } = useAnimationTimeouts();

	const resetAnimation = useCallback(() => {
		setClickedBoxes([]);
		setIsAnimating(false);
		clearAllTimeouts();
	}, [clearAllTimeouts]);

	const handleBoxClick = useCallback(
		(boxId: number) => {
			if (isAnimating) return;

			// Check if box is already green
			const box = boxes.find((b) => b.id === boxId);
			if (!box || box.isGreen) return;

			// Update boxes to green
			setBoxes((prevBoxes) =>
				prevBoxes.map((b) =>
					b.id === boxId ? ({ ...b, isGreen: true } as T) : b,
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
									b.id === clickedBoxId ? ({ ...b, isGreen: false } as T) : b,
								),
							);

							// If this is the last box to revert, reset the animation state
							if (index === newClickedBoxes.length - 1) {
								setIsAnimating(false);
								setClickedBoxes([]);
							}
						},
						(index + 1) * animationDelay,
					);

					addTimeout(timeout);
				});
			}
		},
		[boxes, clickedBoxes, isAnimating, setBoxes, animationDelay, addTimeout],
	);

	return {
		clickedBoxes,
		isAnimating,
		handleBoxClick,
		resetAnimation,
	};
}
