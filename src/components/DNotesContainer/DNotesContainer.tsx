import { useEffect, useState } from 'react';
import './index.less';
import DNotesContainerItem from '../DNotesContainerItem';
import { getLocalDNotesList, setLocalDNotesList } from '../../utils';
import { IState } from '../../store/dNotesReducer';
interface IDNotesContainerProps {
	searchText: string;
}
export default function DNotesContainer(props: IDNotesContainerProps) {
	const { searchText } = props;
	const [dNotesArr, setDNotesArr] = useState<IState[]>(getLocalDNotesList());

	useEffect(() => {
		// 第一次打开需要设置localstorage
		setLocalDNotesList(dNotesArr);
	}, []);
	useEffect(() => {
		// 定时更新localstorage数据 当正在搜索的时候就不更新了
		let timer = setInterval(() => {
			// console.log('当前的搜索内容', searchText);
			if (searchText === '') {
				// 拿到新的数据
				const oldDNoteList = getLocalDNotesList();
				// 把新的数据渲染到页面中
				setDNotesArr(oldDNoteList);
			}
		}, 1000);
		return () => {
			clearInterval(timer);
		};
	}, [searchText]);
	const deleteItemHandler = () => {
		// 拿到新的数据
		const oldDNoteList = getLocalDNotesList();
		// 把新的数据渲染到页面中
		setDNotesArr(oldDNoteList);
	};
	useEffect(() => {
		// 当搜索文案发生变化的时候 更改搜索的内容
		let oldDNoteList = getLocalDNotesList();
		if (searchText !== '') {
			oldDNoteList = oldDNoteList.filter((item) => {
				if (item.text.includes(searchText)) {
					return item;
				}
			});
		}
		console.log('剩下的列表', oldDNoteList);
		setDNotesArr(oldDNoteList);
	}, [searchText]);
	return (
		<div className="dnotes-container">
			{dNotesArr &&
				dNotesArr.map((item) => {
					if (
						item.text &&
						item.text !== '<p><br></p>' &&
						// @ts-ignore
						item.isDeleted !== true
					) {
						return (
							<DNotesContainerItem
								{...item}
								key={item.id}
								deleteItemHandler={deleteItemHandler}
							/>
						);
					} else {
						return null;
					}
				})}
		</div>
	);
}
