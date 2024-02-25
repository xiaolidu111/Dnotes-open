import { IState } from '../store/dNotesReducer';

export interface IColorMode {
	title: string;
	content: string;
}
export interface IColorTheme {
	white: IColorMode;
	blue: IColorMode;
	yellow: IColorMode;
	pink: IColorMode;
	black: IColorMode;
}
export const ColorTheme = {
	white: {
		title: '#dfdfdf',
		content: '#f8f8f8',
	},
	blue: {
		title: '#8accff',
		content: '#c6e6ff',
	},
	yellow: {
		title: '#ffe774',
		content: '#fff1a1',
	},
	pink: {
		title: '#d6acfe',
		content: '#e4c9ff',
	},
	black: {
		title: '#8d8787',
		content: '#c1bcbc',
	},
};
// 合并云端和本地数据

export const mergeArrays = (arr1: IState[], arr2: IState[]): IState[] => {
	const mergedArray = [...arr1, ...arr2];
	const dictionary = {};
	for (const element of mergedArray) {
		const id = element.id;
		const lastModified = element.lastModified;
		// @ts-ignore
		if (!dictionary[id] || lastModified > dictionary[id].lastModified) {
			// @ts-ignore
			dictionary[id] = element;
		}
	}
	const mergedSortedArray = Object.values(dictionary).sort(
		// @ts-ignore
		(a, b) => b.id - a.id
	);

	return mergedSortedArray as IState[];
};

export function encode64(text: string): string {
	return btoa(String.fromCharCode(...new TextEncoder().encode(text)));
}

export function decode64(text: string): string {
	return new TextDecoder().decode(
		Uint8Array.from(atob(text), (c) => c.charCodeAt(0))
	);
}
