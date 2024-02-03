import '@wangeditor/editor/dist/css/style.css'; // 引入 css
import './index.less';
import { useState, useEffect } from 'react';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import {
	IDomEditor,
	IEditorConfig,
	IToolbarConfig,
	DomEditor,
} from '@wangeditor/editor';
import { convertStringToHTML } from '../../utils';
interface IRichTextProps {
	setTextString: (html: string) => void;
	textString?: string;
}
export default function RichText(props: IRichTextProps) {
	const { setTextString, textString } = props;
	// editor 实例
	const [editor, setEditor] = useState<IDomEditor | null>(null); // TS 语法
	console.log('此时的textString', textString);
	// 编辑器内容
	const [html, setHtml] = useState(textString || '<p></p>');
	useEffect(() => {
		// const nowHTML =convertStringToHTML(textString);
		setHtml(textString as string);
	}, [textString]);
	useEffect(() => {
		// if (textString) {
		// 	setTextString(textString);
		// } else {
		// 	setTextString(html);
		// }
		setTextString(html);
	}, [html]);

	// 工具栏配置
	const toolbarConfig: Partial<IToolbarConfig> = {}; // TS 语法
	// const toolbarConfig = { }                        // JS 语法
	const toolbar = DomEditor.getToolbar(editor as IDomEditor);
	const curToolbarConfig = toolbar?.getConfig();
	console.log(
		'curToolbarConfig?.toolbarKeys',
		curToolbarConfig,
		curToolbarConfig?.toolbarKeys,
		editor?.getAllMenuKeys(),
		editor?.getHtml()
	); // 当前菜单排序和分组
	toolbarConfig.toolbarKeys = [
		// 菜单 key
		// 'headerSelect',

		// 分割线
		// '|',

		// 菜单 key
		'bold',
		// 'italic',
		'fontSize',
		'underline',
		'numberedList',
		'code',
		// 'uploadImage',
		'insertImage',
		'todo',
	];
	// 编辑器配置
	const editorConfig: Partial<IEditorConfig> = {
		// TS 语法
		// const editorConfig = {                         // JS 语法
		placeholder: '请输入内容...',
	};

	useEffect(() => {
		if (editorConfig.MENU_CONF) {
			editorConfig.MENU_CONF!['uploadImage'] = {
				server: '/api/upload',
			};
		}
	}, [editorConfig]);
	// 及时销毁 editor ，重要！
	useEffect(() => {
		return () => {
			if (editor == null) return;
			editor.destroy();
			setEditor(null);
		};
	}, [editor]);
	return (
		<>
			<div
				className="rich-text-container"
				style={{
					border: '1px solid #ccc',
					zIndex: 100,
				}}
			>
				<Editor
					className="rich-text-editor"
					defaultConfig={editorConfig}
					value={html}
					onCreated={setEditor}
					onChange={(editor) => setHtml(editor.getHtml())}
					mode="default"
				/>
				<Toolbar
					className="rich-text-toolbar"
					editor={editor}
					defaultConfig={toolbarConfig}
					mode="default"
					style={{ borderBottom: '1px solid #ccc' }}
				/>
			</div>
		</>
	);
}
