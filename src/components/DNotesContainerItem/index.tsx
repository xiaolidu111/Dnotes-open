import { getLocalDNotesList, setLocalDNotesList } from '../../utils';
import { CloseOutlined } from '@ant-design/icons';
import { WebviewWindow } from '@tauri-apps/api/window';
import { ColorTheme, IColorMode } from '../../utils/constant';
interface IDNotesContainerItemProps {
	id: number;
	text: string;
	colorMode: IColorMode;
	deleteItemHandler: () => void;
}
export default function DNotesContainerItem(props: IDNotesContainerItemProps) {
	const { text, id, deleteItemHandler, colorMode } = props;
	// console.log('colorModecolorModecolorMode', colorMode);
	const deleteHandler = () => {
		//  拿到所有的数据
		let oldDNotesList = getLocalDNotesList();
		// 删除掉当前的id数据
		// oldDNotesList = oldDNotesList.filter((item) => item.id !== id);
		oldDNotesList = oldDNotesList.map((item) => {
			if (item.id !== id) {
				return item;
			} else {
				return {
					...item,
					isDeleted: true,
				};
			}
		});
		setLocalDNotesList(oldDNotesList);
		deleteItemHandler();
		// 关闭这个的webview
		let win = WebviewWindow.getByLabel(`addNew/${id}`);
		win?.close();
	};
	const editHandler = () => {
		console.log('开始编辑');
		let win = WebviewWindow.getByLabel(`addNew/${id}`);
		if (win) {
			win?.setFocus();
		} else {
			const webview = new WebviewWindow(`addNew/${id}`, {
				url: `/addNew/${id}`,
				decorations: false,
				width: 350,
				height: 370,
				center: false,
			});
			console.log('webview', webview);
			webview.once('tauri://created', function () {
				// webview window successfully created
				console.log('创建成功');
			});
			webview.once('tauri://error', function (e) {
				// an error occurred during webview window creation
				console.log('创建失败', e);
			});
		}
	};
	return (
		<div
			className="dnotes-item"
			onDoubleClick={editHandler}
			style={{
				backgroundColor:
					colorMode?.content || ColorTheme.yellow.content,
			}}
		>
			<div
				className="dnotes-item-top"
				style={{
					backgroundColor:
						colorMode?.title || ColorTheme.yellow.title,
				}}
			></div>
			<div
				className="dnotes-item-content"
				dangerouslySetInnerHTML={{ __html: text }}
			></div>
			<div className="dnotes-item-bottom" onClick={deleteHandler}>
				<CloseOutlined
					style={{
						backgroundColor:
							colorMode?.content || ColorTheme.yellow.content,
					}}
				/>
			</div>
		</div>
	);
}
