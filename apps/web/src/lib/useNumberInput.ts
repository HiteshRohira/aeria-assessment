import { useState } from "react";

interface UseNumberInputOptions {
	min: number;
	max: number;
	errorMessage?: string;
}

interface UseNumberInputReturn {
	value: string;
	error: string;
	isValid: boolean;
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	reset: () => void;
}

export function useNumberInput(options: UseNumberInputOptions): UseNumberInputReturn {
	const { min, max, errorMessage } = options;
	const [value, setValue] = useState<string>("");
	const [error, setError] = useState<string>("");

	const validateInput = (inputValue: string): boolean => {
		if (inputValue === "") {
			setError("");
			return false;
		}

		const num = Number.parseInt(inputValue);
		if (Number.isNaN(num)) {
			setError("Please enter a valid number");
			return false;
		}
		if (num < min || num > max) {
			setError(errorMessage || `Number must be between ${min} and ${max} (inclusive)`);
			return false;
		}
		setError("");
		return true;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setValue(newValue);
		validateInput(newValue);
	};

	const reset = () => {
		setValue("");
		setError("");
	};

	return {
		value,
		error,
		isValid: value !== "" && error === "",
		handleChange,
		reset,
	};
}
