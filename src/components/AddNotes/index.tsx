import { useEffect, useState } from 'react';
import './index.less';
import MainHeader from '../MainHeader';
import TextArea from 'antd/es/input/TextArea';
import { WebviewWindow } from '@tauri-apps/api/window';

import { getLocalDNotesList } from '../../utils';
import { IColorMode } from '../../utils/constant';
import RichText from '../RichText';
const DEFAULTCLASS = 'add-notes-container';

export default function AddNotes() {
	const [textString, setTextString] = useState<string>('');
	// 设置初识的textstring
	const [initaltextString, setInitalTextString] = useState<string>('');
	const [idNumber, setIdNumber] = useState<number>(-1);
	const [newDnoteText, setNewDnoteText] = useState<string>('');
	const [colorModeNow, setColorModeNow] = useState<IColorMode>();

	const saveHandler = () => {
		console.log('newDnoteText', newDnoteText, 'textString', textString);

		if (newDnoteText === textString) {
			return;
		}
		setNewDnoteText(textString);
		const newDnoteNow = {
			id: idNumber,
			text: textString,
			colorMode: colorModeNow as IColorMode,
		};
		// setNewDnotes((state) => newDnoteNow);
		console.log('新的数据', newDnoteNow);
		// 将新的数据存入到locakstorage中
		const oldDNoteList = getLocalDNotesList();
		let isHave = false;
		oldDNoteList.forEach((item) => {
			if (item.id === newDnoteNow.id) {
				item.text = newDnoteNow.text;
				isHave = true;
			}
		});
		if (!isHave) {
			oldDNoteList.unshift(newDnoteNow);
		}
		localStorage.setItem('dNotesArr', JSON.stringify(oldDNoteList));
	};
	useEffect(() => {
		let win;
		if (location.pathname === '/') {
			win = WebviewWindow.getByLabel(`main`);
		} else {
			const idNumberNow = Number(location.pathname.split('/')[2]);
			// console.log('当前的id', idNumberNow);
			setIdNumber(idNumberNow);
		}
		let timer = setInterval(() => {
			saveHandler();
		}, 1000);
		return () => {
			clearInterval(timer);
		};
	}, [idNumber, textString, newDnoteText]);
	useEffect(() => {
		let win;
		if (location.pathname === '/') {
			win = WebviewWindow.getByLabel(`main`);
		} else {
			const idNumberNow = Number(location.pathname.split('/')[2]);
			// console.log('当前的id', idNumberNow);
			setIdNumber(idNumberNow);
			// 拿到当前的id寻找当前的数据并显示
			const dNotesList = getLocalDNotesList();
			const dNotesNow = dNotesList.find(
				(item) => item.id === idNumberNow
			);
			console.log('当前的数据是', dNotesNow, textString);
			setTextString(dNotesNow?.text as string);
			setInitalTextString(dNotesNow?.text as string);
			setColorModeNow(dNotesNow?.colorMode);
		}
	}, []);
	const changeColorThemeHandler = () => {
		// 拿到当前的id寻找当前的数据并显示
		const dNotesList = getLocalDNotesList();
		const dNotesNow = dNotesList.find((item) => item.id === idNumber);
		console.log('当前的数据是', dNotesNow);
		setTextString(dNotesNow?.text as string);
		setColorModeNow(dNotesNow?.colorMode);
	};
	return (
		<div className={`${DEFAULTCLASS}`}>
			<MainHeader
				textString={textString}
				colorMode={colorModeNow}
				changeColorThemeHandler={changeColorThemeHandler}
			/>
			{/* <TextArea
				value={textString}
				onChange={textChangeHandler}
				style={{ backgroundColor: colorModeNow?.content }}
			/> */}
			<RichText
				setTextString={setTextString}
				textString={initaltextString}
			/>
		</div>
	);
}
