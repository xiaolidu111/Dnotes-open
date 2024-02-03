import { createSlice } from '@reduxjs/toolkit';
import { IColorMode } from '../utils/constant';

//  数据结构
//  id  text
export interface IState {
	id: number;
	text: string;
	colorMode: IColorMode;
	lastModified?: number;
}
// interface IActionType {
// 	type: 'ADD';
// 	payload?: IState;
// }
export const dNotesReducer = createSlice({
	name: 'dNotesArr',
	initialState: [
		{
			id: 0,
			text: '欢迎使用Dnotes,双击修改笔记，退出应用前请手动上传文件',
		},
	],
	reducers: {
		addDnote: (state, action) => {
			// Redux Toolkit allows us to write "mutating" logic in reducers. It
			// doesn't actually mutate the state because it uses the Immer library,
			// which detects changes to a "draft state" and produces a brand new
			// immutable state based off those changes
			console.log('触发了这个', action.payload);
			state.unshift(action.payload);
		},
	},
});

// Action creators are generated for each case reducer function
export const { addDnote } = dNotesReducer.actions;

export default dNotesReducer.reducer;
