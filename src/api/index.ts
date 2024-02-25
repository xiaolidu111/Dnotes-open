import { http } from '@tauri-apps/api';
import { getLocalstorageItem } from '../utils';

// 登录接口
export const login = async (username: string, password: string) => {
	const loginRes = await http.fetch('https://gitee.com/oauth/token', {
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
	});
	return loginRes;
};
// 获取用户信息
export const getUserInfo = async (access_token: string) => {
	const userInfoRes = await http.fetch(
		`https://gitee.com/api/v5/user?access_token=${access_token}`,
		{
			method: 'GET',
		}
	);
	return userInfoRes;
};
// 查看用户是否已经有这个文件的信息
export const checkIsHavenFile = async (name: string, access_token: string) => {
	const isHavenFileRes = await http.fetch(
		`https://gitee.com/api/v5/repos/${name}/DNotesData/contents/appdata%2Fappdata.txt?access_token=${access_token}`
	);
	return isHavenFileRes;
};
// 将base64格式的内容上传
export const uploadData = async (
	name: string,
	access_token: string,
	mergeListString: string,
	sha: string
) => {
	const uploadDataRes = await http.fetch(
		`https://gitee.com/api/v5/repos/${name}/DNotesData/contents/appdata%2Fappdata.txt`,
		{
			method: 'PUT',
			body: http.Body.json({
				access_token: access_token,
				content: mergeListString,
				sha: sha,
				message: '上传文件',
			}),
		}
	);
	return uploadDataRes;
};
// 新创建一个名字叫做DNotes的仓库 并初始化
export const reCreateFile = async () => {
	const reCreateFileRes = await http.fetch(
		'https://gitee.com/api/v5/user/repos',
		{
			method: 'POST',
			body: http.Body.json({
				access_token: getLocalstorageItem('access_token'),
				name: 'DNotesData',
				has_issues: true,
				has_wiki: true,
				can_comment: true,
				auto_init: true,
				private: true,
			}),
		}
	);
	return reCreateFileRes;
};
// 创建一个文件夹新建一个文件
export const reCreateFileTxt = async (name: string) => {
	const reCreateFileTxtRes = await http.fetch(
		`https://gitee.com/api/v5/repos/${name}/DNotesData/contents/appdata%2Fappdata.txt`,
		{
			method: 'POST',
			body: http.Body.json({
				access_token: getLocalstorageItem('access_token'),
				content:
					'W3siaWQiOi0xLCJ0ZXh0Ijoi5qyi6L+O5L2/55SoZE5vdGVzLOWPjOWHu+S/ruaUueeslOiusCIsImNvbG9yTW9kZSI6eyJ0aXRsZSI6IiNmZmU3NzQiLCJjb250ZW50IjoiI2ZmZjFhMSJ9LCJsYXN0TW9kaWZpZWQiOjE3MDY3OTcwNDgxODh9XQ==',
				message: '1',
			}),
		}
	);
	return reCreateFileTxtRes;
};
// 创建一个文件夹新建一个文件
export const reCreateFileText = async () => {
	const reCreateFileTextRes = await http.fetch(
		`https://gitee.com/api/v5/repos/${getLocalstorageItem(
			'name'
		)}/DNotesData/contents/appdata%2Fappdata.txt`,
		{
			method: 'POST',
			body: http.Body.json({
				access_token: getLocalstorageItem('access_token'),
				content:
					'W3siaWQiOi0xLCJ0ZXh0Ijoi5qyi6L+O5L2/55SoZE5vdGVzLOWPjOWHu+S/ruaUueeslOiusCIsImNvbG9yTW9kZSI6eyJ0aXRsZSI6IiNmZmU3NzQiLCJjb250ZW50IjoiI2ZmZjFhMSJ9LCJsYXN0TW9kaWZpZWQiOjE3MDY3OTcwNDgxODh9XQ==',
				message: '1',
			}),
		}
	);
	return reCreateFileTextRes;
};
export const fetchNewToken = async (refresh_token: string) => {
	const res = await http.fetch(
		`https://gitee.com/oauth/token?grant_type=refresh_token&refresh_token=${refresh_token}`,
		{
			method: 'POST',
		}
	);
	console.log('请求新的token', res);
	return res.data;
};
