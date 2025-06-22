import { useEffect, useRef } from "react";

export function useAnimationTimeouts() {
	const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

	const addTimeout = (timeout: NodeJS.Timeout) => {
		timeoutsRef.current.push(timeout);
	};

	const clearAllTimeouts = () => {
		timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
		timeoutsRef.current = [];
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			clearAllTimeouts();
		};
	}, []);

	return {
		addTimeout,
		clearAllTimeouts,
	};
}
