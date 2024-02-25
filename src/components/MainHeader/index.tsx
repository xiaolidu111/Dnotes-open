import { useEffect, useState } from 'react';
import './index.less';
import {
	CloseOutlined,
	CloudUploadOutlined,
	LoadingOutlined,
	PlusOutlined,
	PushpinFilled,
	PushpinOutlined,
	UnorderedListOutlined,
	UserAddOutlined,
	UserDeleteOutlined,
} from '@ant-design/icons';
import { WebviewWindow } from '@tauri-apps/api/window';
import { useLocation } from 'react-router-dom';
import {
	getLocalDNotesList,
	getLocalstorageItem,
	removeLocalstorageItem,
	setLocalDNotesList,
	setLocalstorageItem,
} from '../../utils';
import {
	Button,
	Form,
	Input,
	Modal,
	Tooltip,
	message as Message,
	message,
} from 'antd';
import {
	ColorTheme,
	IColorMode,
	decode64,
	encode64,
	mergeArrays,
} from '../../utils/constant';
import { IState } from '../../store/dNotesReducer';
import { relaunch } from '@tauri-apps/api/process';
import {
	checkIsHavenFile,
	fetchNewToken,
	getUserInfo,
	login,
	reCreateFile,
	reCreateFileText,
	reCreateFileTxt,
	uploadData,
} from '../../api';
const DEFAULTCLASS = 'main-page-header';

interface IMainHeaderProps {
	textString?: string;
	colorMode?: IColorMode;
	changeColorThemeHandler?: () => void;
	qrCode?: string;
	deviceCode?: string;
}
type FieldType = {
	username?: string;
	password?: string;
	qrCode?: string;
};
export default function MainHeader(props: IMainHeaderProps) {
	const [avatarUrl, setAvatarurl] = useState<string | null>(
		getLocalstorageItem('avatar_url') || ''
	);

	const [open, setOpen] = useState(false);
	const [loginBtnDisable, setLoginBtnDisable] = useState<boolean>(false);
	const [logoutopen, setLogoutopen] = useState(false);
	const [myWebview, setMywebview] = useState<WebviewWindow | null>(null);
	const [alwaysOnTop, setAlwaysOntop] = useState<boolean>(false);
	const [idNumber, setIdNumber] = useState<number>(-10);
	// 切换颜色
	const [isShowMenu, setIsShowMenu] = useState<boolean>(false);
	const location = useLocation();
	const onFinish = async (values: any) => {
		setLoginBtnDisable(true);
		console.log('Success:', values);
		// 拿到用户输入的用户名和密码
		const { username, password } = values;
		// 调用登录接口完成登录
		// 拿到用户的accesstoken

		try {
			const { name, access_token } = await loginAndGetUserInfo(
				username,
				password
			);
			const { mergeList, sha } = await checkFileAndMergeData(
				name,
				access_token
			);
			await uploadMergedData(name, access_token, mergeList, sha);
			hideModal();
			Message.success('登录成功', 1);
		} catch (err: any) {
			console.log('出错了', err, 'err.message', err.message);
			if (err.message === '文件上传失败，请重试1') {
				Message.error('文件上传失败，请重新登录', 1);
				hideModal();
			} else if (err.message === '不存在该文件，需要重新创建') {
				try {
					await createRepoAndFile();
				} catch (err: any) {
					await handleError(err);
				}
			} else if (err.message === '用户信息获取失败') {
				Message.error('用户信息获取失败，请重试', 1);
				hideModal();
			} else if (err.message === '用户名或密码错误') {
				Message.error('登录失败，请检查输入信息和网略', 1);
				hideModal();
			} else {
				Message.error(err.message, 3);
			}
		}
	};

	// 登录并获得用户信息
	const loginAndGetUserInfo = async (username: string, password: string) => {
		const loginRes = await login(username, password);
		const {
			access_token,
			created_at,
			expires_in,
			refresh_token,
			scope,
			token_type,
		} = loginRes.data as {
			access_token: string;
			created_at: string;
			expires_in: string;
			refresh_token: string;
			scope: string;
			token_type: string;
		};
		if (!access_token) {
			throw new Error('用户名或密码错误');
		}
		// 数据存入localstorage
		setLocalstorageItem('access_token', access_token);
		setLocalstorageItem('created_at', created_at);
		setLocalstorageItem('expires_in', expires_in);
		setLocalstorageItem('refresh_token', refresh_token);
		setLocalstorageItem('scope', scope);
		setLocalstorageItem('token_type', token_type);

		// 获取用户信息 头像用户名
		const userInfoRes = await getUserInfo(access_token);
		console.log('获得的userInfoRes', userInfoRes);
		const { avatar_url, name } = userInfoRes.data as {
			avatar_url: string;
			name: string;
		};
		if (!avatar_url) {
			throw new Error('用户信息获取失败');
		}
		// 存储到本地
		setLocalstorageItem('avatar_url', avatar_url);
		setLocalstorageItem('name', name);
		setAvatarurl(avatar_url);

		return { name, access_token };
	};
	// 检查文件并且合并数据
	const checkFileAndMergeData = async (
		name: string,
		access_token: string
	) => {
		// 查看用户是否已经有这个文件的信息
		const isHavenFileRes = await checkIsHavenFile(name, access_token);
		const { sha, content } = isHavenFileRes.data as {
			sha: string;
			content: string;
		};
		if (!sha) {
			throw new Error('不存在该文件，需要重新创建');
		}
		// 把sha存储在localstorage中
		setLocalstorageItem('sha', sha);
		// 有这个文件 解码文件内容 和本地数据进行对比 将对比结果上传到文件中
		const cloudFileContent = JSON.parse(decode64(content));
		// 拿到云端数据 和本地数据进行对比
		// 拿到本地数据
		const localDNotesList = getLocalDNotesList();

		// 合并两个数据
		const mergeList = mergeArrays(
			localDNotesList,
			cloudFileContent as IState[]
		);
		// 将合并后的数据存储到本地
		setLocalDNotesList(mergeList);

		return { mergeList, sha };
	};
	// 更新合并数据
	const uploadMergedData = async (
		name: string,
		access_token: string,
		mergeList: any,
		sha: string
	) => {
		// 将数据上传到仓库中
		// 将数据转换成字符串 转换成 base64格式
		const mergeListString = encode64(JSON.stringify(mergeList));

		// 将base64格式的内容上传
		const uploadDataRes = await uploadData(
			name,
			access_token,
			mergeListString,
			sha
		);
		const { commit } = uploadDataRes.data as { commit: string };
		if (!commit) {
			throw new Error('文件上传失败，请重试1');
		}
	};
	// 创建仓库和文件
	const createRepoAndFile = async () => {
		// 新创建一个名字叫做DNotes的仓库 并初始化
		const reCreateFileRes = await reCreateFile();
		console.log('创建仓库成功', reCreateFileRes);
		const { error } = reCreateFileRes.data as { error: string };
		if (error) {
			throw new Error('仓库已存在');
		}
		// 创建一个文件夹新建一个文件
		const reCreateFileTxtRes = await reCreateFileTxt(
			getLocalstorageItem('name')
		);
		console.log('创建新文件成功', reCreateFileTxtRes);
		hideModal();

		Message.success('登录成功', 1);
		if (reCreateFileTxtRes.status === 400) {
			throw new Error('创建文件失败');
		}
	};
	// 创建仓库失败的错误处理
	const handleError = async (err: any) => {
		if (err.message === '创建文件失败') {
			console.log('创建文件失败，请重试', err);
			Message.error('创建文件失败，请重新登录', 1);
			hideModal();
		} else if (err.message === '仓库已存在') {
			try {
				console.log('仓库已存在', err);
				// 创建一个文件夹新建一个文件
				const reCreateFileTextRes = await reCreateFileText();
				console.log('创建新文件成功', reCreateFileTextRes);
				hideModal();

				Message.success('登录成功', 1);
				if (reCreateFileTextRes.status === 400) {
					throw new Error('文件已存在');
				}
			} catch (err: any) {
				console.log('文件已存在', err);
				Message.error('网络出错请重试', 1);
				hideModal();
			}
		} else {
			Message.error(err.message, 3);
		}
	};

	const onFinishFailed = (errorInfo: any) => {
		console.log('Failed:', errorInfo);
	};

	useEffect(() => {
		let win;
		if (location.pathname === '/') {
			win = WebviewWindow.getByLabel(`main`);
		} else {
			const idNumberNow = Number(location.pathname.split('/')[2]);
			setIdNumber(idNumberNow);
			win = WebviewWindow.getByLabel(`addNew/${idNumberNow}`);
		}
		setMywebview(win);
	}, []);

	const openCreateWindow = async () => {
		const localDNotesArr = getLocalDNotesList();
		// 打开新窗口设置新id为第一个的id+1
		let id;
		if (localDNotesArr.length) {
			id = localDNotesArr[0]?.id + 1;
		} else {
			id = 1;
		}
		console.log('新的id', id, localDNotesArr, localDNotesArr[0]?.id);
		// 在localstorage中新增一个记录
		// 拿到新的数据
		const oldDNoteList = getLocalDNotesList();
		oldDNoteList.unshift({
			id,
			text: '',
			colorMode: ColorTheme.yellow,
			lastModified: Date.now(),
		});
		// 重新储存
		setLocalDNotesList(oldDNoteList);
		// const id = Math.floor(Math.random() * 10) + 1;
		console.log(
			'当前的wenview',
			myWebview?.outerPosition(),
			myWebview?.innerPosition(),
			myWebview?.outerSize(),
			myWebview?.innerSize()
		);
		const innerPosition = await myWebview?.innerPosition();
		const innerSize = await myWebview?.innerSize();
		console.log('innerPosition', innerPosition?.x, innerSize?.width);
		let screenWidth = window.innerWidth;
		let screenHeight = window.innerHeight;

		let x, y;
		let offset = Math.floor(Math.random() * 1) - 100;
		if (screenWidth / 2 > innerPosition!.x) {
			// 如果左上角在右边 向左
			x = innerPosition!.x - offset;
		} else {
			x = innerPosition!.x + offset;
		}
		if (screenHeight / 2 > innerPosition!.y) {
			// 如果左上角在右边 向左
			y = innerPosition!.y + offset;
		} else {
			y = innerPosition!.y - offset;
		}
		// var x = Math.floor(Math.random() * (screenWidth - 200)) + 100;
		// var y = Math.floor(Math.random() * (screenHeight - 200)) + 100;

		console.log('随机坐标：', x, y);
		const webview = new WebviewWindow(`addNew/${id}`, {
			url: `/addNew/${id}`,
			decorations: false,
			width: 350,
			height: 370,
			center: true,
			x: x,
			y: y,
			// focus: true,
			theme: 'light',
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
	};
	const closeHandler = async () => {
		if (myWebview?.label === 'main') {
			await myWebview.minimize();
		} else {
			// 拿到当前的内容 和 当前的id 拼接成数据 添加到redux中
			const nowDnote = {
				id: idNumber,
				text: props.textString as string,
				colorMode: props.colorMode as IColorMode,
				lastModified: Date.now(),
			};
			// console.log('新的数据是', nowDnote);
			// 数据保存本地
			// 将新的数据存入到locakstorage中
			const oldDNoteList = getLocalDNotesList();
			let isHave = false;
			oldDNoteList.forEach((item) => {
				if (item.id === nowDnote.id) {
					item.text = nowDnote.text as string;
					isHave = true;
				}
			});
			if (!isHave) {
				oldDNoteList.unshift(nowDnote);
			}
			setLocalDNotesList(oldDNoteList);
			myWebview?.close();
		}
	};
	const windowOnTopHandler = () => {
		myWebview?.setAlwaysOnTop(!alwaysOnTop);
		setAlwaysOntop(!alwaysOnTop);
	};
	// 切换颜色
	const showMenuHandler = () => {
		console.log('切换颜色');
		setIsShowMenu(!isShowMenu);
	};
	const changeColorThemeHandler = (colorThemeNow: IColorMode) => {
		console.log('要切换的颜色', colorThemeNow);
		// 拿到当前的事件 更换颜色主题 并将其调整至最前面
		let oldDNotesList = getLocalDNotesList();
		// 删除原来的事件
		oldDNotesList = oldDNotesList.filter((item) => item.id !== idNumber);
		// 生成新事件，并添加到头部
		const nowDnotes = {
			id: idNumber,
			text: props.textString as string,
			colorMode: colorThemeNow,
			lastModified: Date.now(),
		};
		oldDNotesList.unshift(nowDnotes);
		console.log('要存储的', oldDNotesList);
		// 存储到本地
		setLocalDNotesList(oldDNotesList);
		props.changeColorThemeHandler && props.changeColorThemeHandler();
		setIsShowMenu(!isShowMenu);
	};

	const openLoginModal = () => {
		setOpen(true);
	};

	const hideModal = () => {
		setOpen(false);
		setLoginBtnDisable(false);
	};
	const hideLoginModal = async (isLogout: boolean) => {
		if (isLogout) {
			// 上传好数据再同步
			let flag = await uploadDataHandler(true);
			if (flag) {
				// 清除本地的localstorage数据
				localStorage.removeItem('created_at');
				localStorage.removeItem('expires_in');
				localStorage.removeItem('name');
				localStorage.removeItem('scope');
				localStorage.removeItem('refresh_token');
				localStorage.removeItem('access_token');
				localStorage.removeItem('sha');
				localStorage.removeItem('dNotesArr');
				localStorage.removeItem('avatar_url');
				localStorage.removeItem('token_type');

				// 重启应用
				console.log('重启应用');
				await relaunch();
			} else {
				message.error('退出登录失败,请重试', 1);
			}
		} else {
			setLogoutopen(false);
		}
	};

	// 退出登录
	const exitLoginandler = async () => {
		// setLogoutopen(true);
		setLogoutopen(true);
	};

	const getLocalStorageData = () => {
		const name = getLocalstorageItem('name');
		const access_token = getLocalstorageItem('access_token');
		return { name, access_token };
	};
	// 获得文件信息
	const fetchFileInfo = async (name: string, access_token: string) => {
		const res = await checkIsHavenFile(name, access_token);
		if (res.status === 401) {
			throw new Error('重新获取Token');
		}
		const { sha, content } = res.data as { sha: string; content: string };
		if (!sha) {
			throw new Error('不存在该文件，需要重新创建');
		}
		setLocalstorageItem('sha', sha);
		return { sha, content };
	};
	const processFileContent = (content: string) => {
		// 有这个文件 解码文件内容 和本地数据进行对比 将对比结果上传到文件中
		const cloudFileContent = JSON.parse(decode64(content));
		// 拿到云端数据 和本地数据进行对比
		// 拿到本地数据
		const localDNotesList = getLocalDNotesList();

		// 合并两个数据
		const mergeList = mergeArrays(
			localDNotesList,
			cloudFileContent as IState[]
		);
		// 将合并后的数据存储到本地
		setLocalDNotesList(mergeList);
		return mergeList;
	};
	// 上传文件
	const uploadFile = async (
		name: string,
		access_token: string,
		mergeList: any,
		sha: string
	) => {
		const mergeListString = encode64(JSON.stringify(mergeList));
		const res = await uploadData(name, access_token, mergeListString, sha);
		const { commit } = res.data as { commit: string };
		if (!commit) {
			throw new Error('文件上传失败，请重试2');
		}
		return true;
	};
	// 上传同步数据
	const uploadDataHandler = async (showToast: boolean) => {
		try {
			showToast && message.loading('正在同步数据...');
			const { name, access_token } = getLocalStorageData();
			const { sha, content } = await fetchFileInfo(name, access_token);
			const mergeList = processFileContent(content);
			await uploadFile(name, access_token, mergeList, sha);
			showToast && message.destroy();
			showToast && message.success('同步成功', 1);
			return Promise.resolve(true);
		} catch (err: any) {
			console.log('err', err.message);
			if (err.message === '重新获取Token') {
				return checkToken()
					.then(async () => {
						await uploadDataHandler(false);
						message.destroy();
						message.success('同步成功', 1);
					})
					.catch((err: any) => {
						// message.destroy();
						// message.error('同步成功', 1);
						console.log('登录过期，请重新登录', err);
					});
			}
			showToast && message.destroy();
			showToast && Message.error('仓库中不存在该文件，请重新登录', 1);
			return Promise.resolve(false);
		}
	};

	const getRefreshToken = () => {
		const refresh_token = getLocalstorageItem('refresh_token');
		console.log('打印这个refresh_token', refresh_token);
		return refresh_token;
	};

	const processResponseData = (data: any) => {
		const {
			access_token,
			created_at,
			expires_in,
			refresh_token,
			scope,
			token_type,
		} = data;
		console.log(access_token, 'access_token');
		if (!access_token) {
			throw new Error('登录过期,请重新登录');
		}
		setLocalstorageItem('access_token', access_token);
		setLocalstorageItem('created_at', created_at);
		setLocalstorageItem('expires_in', expires_in);
		setLocalstorageItem('refresh_token', refresh_token);
		setLocalstorageItem('scope', scope);
		setLocalstorageItem('token_type', token_type);
	};

	const handleTokenError = (err: any) => {
		removeLocalstorageItem('access_token');
		removeLocalstorageItem('created_at');
		removeLocalstorageItem('expires_in');
		removeLocalstorageItem('refresh_token');
		removeLocalstorageItem('scope');
		removeLocalstorageItem('token_type');
		removeLocalstorageItem('avatar_url');
		removeLocalstorageItem('dNotesArr');
		removeLocalstorageItem('name');
		removeLocalstorageItem('sha');
		console.log('失败了', err.message);
		message.destroy();
		message.error('登录过期,请重新登录', 1);
		setAvatarurl(null);
	};

	// 检查token是否过期
	const checkToken = async () => {
		try {
			const refresh_token = getRefreshToken();
			if (!refresh_token) {
				return;
			}
			const data = await fetchNewToken(refresh_token);
			processResponseData(data);
		} catch (err) {
			handleTokenError(err);
			throw new Error('登录过期,请重新登录');
		}
	};
	useEffect(() => {
		// 每隔一分钟同步一次数据
		let timer: number;
		if (avatarUrl) {
			timer = setInterval(() => {
				console.log('重新同步');
				uploadDataHandler(false);
			}, 600000);
		}
		return () => {
			clearInterval(timer);
		};
	}, [avatarUrl]);
	return (
		<div
			data-tauri-drag-region
			className={`${DEFAULTCLASS}`}
			style={{ backgroundColor: props.colorMode?.title }}
		>
			<div className={`${DEFAULTCLASS}-left`} onClick={openCreateWindow}>
				<Tooltip placement="right">
					<PlusOutlined />
				</Tooltip>
			</div>
			<div className={`${DEFAULTCLASS}-right`}>
				<div className={`${DEFAULTCLASS}-right-setting`}>
					{avatarUrl !== '' && avatarUrl !== null && (
						<Tooltip placement="left" title="同步数据">
							<CloudUploadOutlined
								onClick={() => {
									uploadDataHandler(true);
								}}
							/>
						</Tooltip>
					)}
				</div>
				<div
					className={`${DEFAULTCLASS}-right-setting`}
					onClick={showMenuHandler}
				>
					{idNumber !== -10 ? (
						<Tooltip placement="left" title="切换主题">
							<UnorderedListOutlined />
						</Tooltip>
					) : (
						<Tooltip
							placement="left"
							title={`${
								avatarUrl === '' ? '登录账户' : '退出登录'
							}`}
						>
							{avatarUrl ? (
								<img
									onClick={exitLoginandler}
									className="avatar-url"
									src={avatarUrl}
									alt=""
								/>
							) : open ? (
								<UserDeleteOutlined />
							) : (
								<UserAddOutlined onClick={openLoginModal} />
							)}
						</Tooltip>
					)}
				</div>
				<div
					className={`${DEFAULTCLASS}-right-setting`}
					onClick={windowOnTopHandler}
				>
					{!alwaysOnTop ? (
						<Tooltip placement="left" title="置顶">
							<PushpinOutlined />
						</Tooltip>
					) : (
						<Tooltip placement="left" title="取消置顶">
							<PushpinFilled />
						</Tooltip>
					)}
				</div>
				<div
					className={`${DEFAULTCLASS}-right-close`}
					onClick={closeHandler}
				>
					<Tooltip placement="left" title="关闭">
						<CloseOutlined />
					</Tooltip>
				</div>
			</div>
			{idNumber !== -10 && (
				<div
					className={`${DEFAULTCLASS}-top ${
						isShowMenu ? 'main-page-header-top-active' : ''
					}`}
				>
					{Object.keys(ColorTheme).map((key, index) => {
						return (
							<div
								className="top-color-theme"
								style={{
									// @ts-ignore
									backgroundColor: ColorTheme[key].content,
								}}
								key={index}
								onClick={() =>
									changeColorThemeHandler(
										// @ts-ignore
										ColorTheme[key]
									)
								}
							></div>
						);
					})}
				</div>
			)}
			<Modal
				title="登录gitee账户"
				open={open}
				onOk={hideModal}
				onCancel={hideModal}
				okText="登录"
				cancelText="取消"
			>
				<Form
					name="basic"
					labelCol={{ span: 8 }}
					wrapperCol={{ span: 16 }}
					style={{ maxWidth: 600 }}
					initialValues={{ remember: true }}
					onFinish={onFinish}
					onFinishFailed={onFinishFailed}
					autoComplete="off"
				>
					<Form.Item<FieldType>
						label="用户名"
						name="username"
						rules={[
							{
								required: true,
								message: '请输入蓝奏云账户!',
							},
						]}
					>
						<Input />
					</Form.Item>

					<Form.Item<FieldType>
						label="密码"
						name="password"
						rules={[
							{
								required: true,
								message: '请输入密码!',
							},
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
							disabled={loginBtnDisable}
						>
							{!loginBtnDisable ? '登录' : <LoadingOutlined />}
						</Button>
					</Form.Item>
				</Form>
			</Modal>
			<Modal
				title="退出登录"
				open={logoutopen}
				onOk={() => hideLoginModal(true)}
				onCancel={() => hideLoginModal(false)}
				okText="确认"
				cancelText="取消"
				className="logout-confirm"
			>
				<p>退出登录将重启应用，是否退出登录</p>
			</Modal>
		</div>
	);
}
