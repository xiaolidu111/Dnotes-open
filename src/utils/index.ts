import { IState } from '../store/dNotesReducer';
import { ColorTheme } from './constant';

export const getLocalDNotesList: () => IState[] = () =>
	JSON.parse(window.localStorage.getItem('dNotesArr') as string) || [
		{
			id: -1,
			text: '欢迎使用dNotes,双击修改笔记，退出应用前请手动上传文件',
			colorMode: ColorTheme.yellow,
			lastModified: Date.now(),
		},
	];

export const setLocalDNotesList = (dNotesArr: IState[]) => {
	window.localStorage.setItem('dNotesArr', JSON.stringify(dNotesArr));
};
export const setLocalstorageItem = (name: string, payload: string) => {
	window.localStorage.setItem(name, JSON.stringify(payload));
};
export const removeLocalstorageItem = (name: string) => {
	window.localStorage.removeItem(name);
};
export const getLocalstorageItem = (name: string) => {
	console.log(
		// 'window.localStorage.getItem(name)',
		window.localStorage.getItem(name)
	);
	return JSON.parse(window.localStorage.getItem(name) as string);
};
export const convertStringToHTML = (htmlString: string) => {
	const tempDiv = document.createElement('div'); // 创建一个临时的div元素
	tempDiv.innerHTML = htmlString; // 设置div的innerHTML为HTML字符串
	return tempDiv.firstChild; // 返回div的第一个子节点，即转换后的HTML元素
};
