import { configureStore } from '@reduxjs/toolkit';
import dNotesReducer from './dNotesReducer';
import { useDispatch } from 'react-redux';

// const dNotesReducer = (state: IState, action: IActionType) => {
// 	switch (action.type) {
// 		case 'ADD':
// 			break;
// 		default:
// 			break;
// 	}
// };

const store = configureStore({
	reducer: {
		dNotesArr: dNotesReducer,
	},
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export default store;
