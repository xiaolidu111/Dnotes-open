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
import { http } from '@tauri-apps/api';
import { IState } from '../../store/dNotesReducer';
import { relaunch } from '@tauri-apps/api/process';
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
	const [avatarUrl, setAvatarurl] = useState<string>(
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
	const onFinish = (values: any) => {
		setLoginBtnDisable(true);
		console.log('Success:', values);
		// 拿到用户输入的用户名和密码
		const { username, password } = values;
		// 调用登录接口完成登录
		// 拿到用户的accesstoken
		http.fetch('https://gitee.com/oauth/token', {
			method: 'POST',
			body: http.Body.json({
				grant_type: 'password',
				username: username,
				password: password,
				client_id:
					'f7350fb2dd02f01f5d184c4dff5c0db7da3cbf6d80d4bebf385a14ed18a96e68',
				client_secret:
					'1cdf5565291a57ae0d9a8d5b6018dc69cb99bc856220250776d0e44d871d23a1',
				scope: 'user_info projects pull_requests issues notes keys hook groups gists enterprises',
			}),
		})
			.then((res: any) => {
				console.log('登录的数据', res);
				const {
					access_token,
					created_at,
					expires_in,
					refresh_token,
					scope,
					token_type,
				} = res.data;
				console.log(
					'access_token,created_at,expires_in,refresh_token,scope,token_type',
					access_token,
					created_at,
					expires_in,
					refresh_token,
					scope,
					token_type
				);
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
				http.fetch(
					`https://gitee.com/api/v5/user?access_token=${access_token}`,
					{
						method: 'GET',
					}
				)
					.then((res: any) => {
						console.log('拿到的用户信息', res);
						const { avatar_url, name } = res.data;
						if (!avatar_url) {
							throw new Error('用户信息获取失败');
						}
						// 存储到本地
						setLocalstorageItem('avatar_url', avatar_url);
						setLocalstorageItem('name', name);
						setAvatarurl(avatar_url);
						// 查看用户是否已经有这个文件的信息
						http.fetch(
							`https://gitee.com/api/v5/repos/${name}/DNotes/contents/appdata%2Fappdata.txt?access_token=${access_token}`
						)
							.then((res: any) => {
								console.log('先找下这个文件的信息', res);
								const { sha, content } = res.data;
								if (!sha) {
									throw new Error(
										'不存在该文件，需要重新创建'
									);
								}
								// 把sha存储在localstorage中
								setLocalstorageItem('sha', sha);
								console.log('content', content);
								// 有这个文件 解码文件内容 和本地数据进行对比 将对比结果上传到文件中
								// const cloudFileContent = JSON.parse(
								// 	decodeURIComponent(window.atob(content))
								// );
								const cloudFileContent = JSON.parse(
									decode64(content)
								);
								console.log(
									'cloudFileContent',
									cloudFileContent
								);
								// 拿到云端数据 和本地数据进行对比
								// 拿到本地数据
								const localDNotesList = getLocalDNotesList();

								// 合并两个数据
								const mergeList = mergeArrays(
									localDNotesList,
									cloudFileContent as IState[]
								);
								console.log('合并后的数据', mergeList);
								// 将合并后的数据存储到本地
								setLocalDNotesList(mergeList);
								// 将数据上传到仓库中
								// 将数据转换成字符串 转换成 base64格式
								// const mergeListString = JSON.stringify(mergeList);
								// const mergeListString = window.btoa(
								// 	unescape(
								// 		encodeURIComponent(
								// 			JSON.stringify(mergeList)
								// 		)
								// 	)
								// );
								const mergeListString = encode64(
									JSON.stringify(mergeList)
								);
								console.log(
									'mergeListString',
									mergeListString,
									JSON.stringify(mergeList)
								);
								// 将base64格式的内容上传
								http.fetch(
									`https://gitee.com/api/v5/repos/${name}/DNotes/contents/appdata%2Fappdata.txt`,
									{
										method: 'PUT',
										body: http.Body.json({
											access_token: access_token,
											content: mergeListString,
											sha: sha,
											message: '上传文件',
										}),
									}
								)
									.then((res: any) => {
										console.log('文件上传成功', res);
										const { commit } = res.data;
										if (!commit) {
											throw new Error(
												'文件上传失败，请重试'
											);
										}
										hideModal();
										Message.success('登录成功', 1);
									})
									.catch((err: any) => {
										console.log('出错了', err);

										Message.error(
											'文件上传失败，请重新登录',
											1
										);
										hideModal();
									});
							})
							.catch((err: any) => {
								console.log(
									'获取文件信息失败，不存在文件需要重建',
									err
								);
								// 新创建一个名字叫做DNotes的仓库 并初始化
								http.fetch(
									'https://gitee.com/api/v5/user/repos',
									{
										method: 'POST',
										body: http.Body.json({
											access_token: access_token,
											name: 'DNotes',
											has_issues: true,
											has_wiki: true,
											can_comment: true,
											auto_init: true,
											private: true,
										}),
									}
								)
									.then((res: any) => {
										console.log('创建仓库成功', res);
										const { error } = res.data;
										if (error) {
											throw new Error('仓库已存在');
										}
										// 创建一个文件夹新建一个文件
										http.fetch(
											`https://gitee.com/api/v5/repos/${name}/DNotes/contents/appdata%2Fappdata.txt`,
											{
												method: 'POST',
												body: http.Body.json({
													access_token: access_token,
													content:
														'W3siaWQiOi0xLCJ0ZXh0Ijoi5qyi6L+O5L2/55SoZE5vdGVzLOWPjOWHu+S/ruaUueeslOiusCIsImNvbG9yTW9kZSI6eyJ0aXRsZSI6IiNmZmU3NzQiLCJjb250ZW50IjoiI2ZmZjFhMSJ9LCJsYXN0TW9kaWZpZWQiOjE3MDY3OTcwNDgxODh9XQ==',
													message: '1',
												}),
											}
										)
											.then((res: any) => {
												console.log(
													'创建新文件成功',
													res
												);
												hideModal();

												Message.success('登录成功', 1);
												if (res.status === 400) {
													throw new Error(
														'创建文件失败'
													);
												}
											})
											.catch((err: any) => {
												console.log(
													'创建文件失败，请重试',
													err
												);

												Message.error(
													'创建文件失败，请重新登录',
													1
												);
												hideModal();
											});
									})
									.catch((err: any) => {
										console.log('仓库已存在', err);
										// 创建一个文件夹新建一个文件
										http.fetch(
											`https://gitee.com/api/v5/repos/${name}/DNotes/contents/appdata%2Fappdata.txt`,
											{
												method: 'POST',
												body: http.Body.json({
													access_token: access_token,
													content:
														'W3siaWQiOi0xLCJ0ZXh0Ijoi5qyi6L+O5L2/55SoZE5vdGVzLOWPjOWHu+S/ruaUueeslOiusCIsImNvbG9yTW9kZSI6eyJ0aXRsZSI6IiNmZmU3NzQiLCJjb250ZW50IjoiI2ZmZjFhMSJ9LCJsYXN0TW9kaWZpZWQiOjE3MDY3OTcwNDgxODh9XQ==',
													message: '1',
												}),
											}
										)
											.then((res: any) => {
												console.log(
													'创建新文件成功',
													res
												);
												hideModal();

												Message.success('登录成功', 1);
												if (res.status === 400) {
													throw new Error(
														'文件已存在'
													);
												}
											})
											.catch((err: any) => {
												console.log(
													'创建文件失败，请重试',
													err
												);

												Message.error(
													'创建文件失败，请重新登录',
													1
												);
												hideModal();
											});
									});
							});
					})
					.catch((err: any) => {
						Message.error('用户信息获取失败，请重试', 1);
						hideModal();
					});
			})
			.catch((err: any) => {
				Message.error('登录失败，请检查输入信息和网略', 1);
				hideModal();
			});
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
		let offset = Math.floor(Math.random() * 1) - 500;
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
			center: false,
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
	const closeHandler = () => {
		if (myWebview?.label === 'main') {
			myWebview.minimize();
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
			await relaunch();
		} else {
			setLogoutopen(false);
		}
	};

	// 退出登录
	const exitLoginandler = async () => {
		// setLogoutopen(true);
		setLogoutopen(true);
	};
	// 上传同步数据
	const uploadDataHandler = async () => {
		// 拉取数据 对比数据 上传数据
		const name = getLocalstorageItem('name');
		const access_token = getLocalstorageItem('access_token');
		message.loading('正在同步数据...');
		http.fetch(
			`https://gitee.com/api/v5/repos/${name}/DNotes/contents/appdata%2Fappdata.txt?access_token=${access_token}`
		)
			.then((res: any) => {
				console.log('先找下这个文件的信息', res);
				const { sha, content } = res.data;
				if (!sha) {
					throw new Error('不存在该文件，需要重新创建');
				}
				// 把sha存储在localstorage中
				setLocalstorageItem('sha', sha);
				console.log('content', content);
				// 有这个文件 解码文件内容 和本地数据进行对比 将对比结果上传到文件中
				// const cloudFileContent = JSON.parse(
				// 	unescape(decodeURIComponent(window.atob(content)))
				// );
				const cloudFileContent = JSON.parse(decode64(content));
				console.log('cloudFileContent', cloudFileContent);
				// 拿到云端数据 和本地数据进行对比
				// 拿到本地数据
				const localDNotesList = getLocalDNotesList();

				// 合并两个数据
				const mergeList = mergeArrays(
					localDNotesList,
					cloudFileContent as IState[]
				);
				console.log('合并后的数据', mergeList);
				// 将合并后的数据存储到本地
				setLocalDNotesList(mergeList);
				// 将数据上传到仓库中
				// 将数据转换成字符串 转换成 base64格式
				// const mergeListString = JSON.stringify(mergeList);
				// const mergeListString = window.btoa(
				// 	unescape(encodeURIComponent(JSON.stringify(mergeList)))
				// );
				const mergeListString = encode64(JSON.stringify(mergeList));
				console.log(
					'mergeListString',
					mergeListString,
					JSON.stringify(mergeList)
				);
				// 将base64格式的内容上传
				http.fetch(
					`https://gitee.com/api/v5/repos/${name}/DNotes/contents/appdata%2Fappdata.txt`,
					{
						method: 'PUT',
						body: http.Body.json({
							access_token: access_token,
							content: mergeListString,
							sha: sha,
							message: '上传文件',
						}),
					}
				)
					.then((res: any) => {
						console.log('文件上传成功', res);
						const { commit } = res.data;
						if (!commit) {
							throw new Error('文件上传失败，请重试');
						}
						message.destroy();
						message.success('同步成功');
					})
					.catch((err: any) => {
						console.log('出错了', err);
						message.destroy();
						Message.error('文件上传失败，请重试', 1);
					});
			})
			.catch((err: any) => {
				message.destroy();
				Message.error('仓库中不存在该文件，请重新登录', 1);
			});
	};
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
				<div
					className={`${DEFAULTCLASS}-right-setting`}
					onClick={uploadDataHandler}
				>
					{avatarUrl !== '' && (
						<Tooltip placement="left" title="同步数据">
							<CloudUploadOutlined />
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
