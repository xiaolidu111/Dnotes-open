import { IState } from '../store/dNotesReducer';

export interface IColorMode {
	title: string;
	content: string;
}
export interface IColorTheme {
	white: IColorMode;
	blue: IColorMode;
	yellow: IColorMode;
	pink: IColorMode;
	black: IColorMode;
}
export const ColorTheme = {
	white: {
		title: '#dfdfdf',
		content: '#f8f8f8',
	},
	blue: {
		title: '#8accff',
		content: '#c6e6ff',
	},
	yellow: {
		title: '#ffe774',
		content: '#fff1a1',
	},
	pink: {
		title: '#d6acfe',
		content: '#e4c9ff',
	},
	black: {
		title: '#8d8787',
		content: '#c1bcbc',
	},
};
// 合并云端和本地数据

export const mergeArrays = (arr1: IState[], arr2: IState[]): IState[] => {
	const mergedArray = [...arr1, ...arr2];
	const dictionary = {};
	for (const element of mergedArray) {
		const id = element.id;
		const lastModified = element.lastModified;
		// @ts-ignore
		if (!dictionary[id] || lastModified > dictionary[id].lastModified) {
			// @ts-ignore
			dictionary[id] = element;
		}
	}
	const mergedSortedArray = Object.values(dictionary).sort(
		// @ts-ignore
		(a, b) => b.id - a.id
	);

	return mergedSortedArray as IState[];
};

export function encode64(text: string): string {
	return btoa(String.fromCharCode(...new TextEncoder().encode(text)));
}

export function decode64(text: string): string {
	return new TextDecoder().decode(
		Uint8Array.from(atob(text), (c) => c.charCodeAt(0))
	);
}
// 在 生产模式的时候 BASE_URL === 'http://api.hahaha.com'
// 在 开发模式的时候 BASE_URL === ''

// 请求接口
// 	http.fetch(
// 		'https://openapi.baidu.com/oauth/2.0/device/code?response_type=device_code&client_id=xLP7hrgkoiO3skwxZEgVivGKqyHf11z5&scope=basic,netdisk',
// 		{
// 			method: 'GET',
// 		}
// 	)
// 		.then((res) => {
// 			console.log('打印的结果', res);
// 			const {
// 				device_code,
// 				expires_in,
// 				interval,
// 				qrcode_url,
// 				user_code,
// 				verification_url,
// 			} = res.data;
// 			console.log(
// 				'device_code,expires_in,interval,qrcode_url,user_code,verification_url,',
// 				device_code,
// 				expires_in,
// 				interval,
// 				qrcode_url,
// 				user_code,
// 				verification_url
// 			);
// 			setDeviceCode(device_code);
// 			setQrcode(qrcode_url);
// 		})
// 		.catch((err) => {
// 			console.log('出现错误', err);
// 		});

// http.fetch(
// 	`https://openapi.baidu.com/oauth/2.0/token?grant_type=device_token&code=${props.deviceCode}&client_id=xLP7hrgkoiO3skwxZEgVivGKqyHf11z5&client_secret=4gJA4oh1t8ALxURHIvbHAuRp8z57yRWh`,
// 	{
// 		method: 'GET',
// 	}
// )
// 	.then((res: any) => {
// 		console.log('轮询的结果', res);
// 		const {
// 			expires_in,
// 			refresh_token,
// 			access_token,
// 			session_secret,
// 			session_key,
// 			scope,
// 		} = res.data;
// 		console.log(
// 			'expires_in,refresh_token,access_token,session_secret,session_key,scope',
// 			expires_in,
// 			refresh_token,
// 			access_token,
// 			session_secret,
// 			session_key,
// 			scope
// 		);
// 		if (expires_in === undefined) {
// 			throw Error('获取信息失败');
// 		}
// 		setLocalstorageItem('expires_in', expires_in);
// 		setLocalstorageItem('refresh_token', refresh_token);
// 		setLocalstorageItem('access_token', access_token);
// 		setLocalstorageItem('session_secret', session_secret);
// 		setLocalstorageItem('session_key', session_key);
// 		setLocalstorageItem('scope', scope);
// 		// 拿到用户信息
// 		// axios
// 		// 	.get('/baidu/rest/2.0/xpan/nas?method=uinfo', {
// 		// 		params: {
// 		// 			access_token: access_token,
// 		// 		},
// 		// 	})
// 		// 	.then((res: any) => {
// 		// 		console.log('拿到的用户信息', res);
// 		// 		const {
// 		// 			avatar_url,
// 		// 			baidu_name,
// 		// 			netdisk_name,
// 		// 			request_id,
// 		// 		} = res.data;
// 		// 		// avatar_url,baidu_name,netdisk_name,request_id
// 		// 		setAvatarurl(avatar_url);
// 		// 		setLocalstorageItem('avatar_url', avatar_url);
// 		// 		setLocalstorageItem('baidu_name', baidu_name);
// 		// 		setLocalstorageItem('netdisk_name', netdisk_name);
// 		// 		setLocalstorageItem('request_id', request_id);
// 		// 	})
// 		// 	.catch((err: any) => {
// 		// 		console.log('用户信息获取失败', err);
// 		// 	});
// 		http.fetch(
// 			`https://pan.baidu.com/rest/2.0/xpan/nas?method=uinfo&access_token=${access_token}`,
// 			{
// 				method: 'GET',
// 			}
// 		)
// 			.then((res: any) => {
// 				console.log('拿到的用户信息', res);
// 				const {
// 					avatar_url,
// 					baidu_name,
// 					netdisk_name,
// 					request_id,
// 				} = res.data;
// 				// avatar_url,baidu_name,netdisk_name,request_id
// 				setAvatarurl(avatar_url);
// 				setLocalstorageItem('avatar_url', avatar_url);
// 				setLocalstorageItem('baidu_name', baidu_name);
// 				setLocalstorageItem('netdisk_name', netdisk_name);
// 				setLocalstorageItem('request_id', request_id);
// 			})
// 			.catch((err: any) => {
// 				console.log('用户信息获取失败', err);
// 			});
// 		clearInterval(timer);
// 		setOpen(false);
// 	})
// 	.catch((err: any) => {
// 		console.log('没查到', err);
// 	});

// http.fetch(
// 	`https://d.pcs.baidu.com/rest/2.0/pcs/file?method=upload&access_token=${access_token}&path=/apps/DNotes/chifanapp.json&ondup=overwrite`,
// 	{
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'multipart/form-data',
// 		},
// 		body: {
// 			type: 'Form',
// 			payload: file,
// 		},
// 	}
// )
// 	.then((res: any) => {
// 		console.log('文件上传成功', res);
// 	})
// 	.catch((err: any) => {
// 		console.log('文件上传失败', err);
// 	});

// axios
// 	.get(
// 		'/api/oauth/2.0/authorize?response_type=token&client_id=xLP7hrgkoiO3skwxZEgVivGKqyHf11z5&redirect_uri=oob&scope=netdisk'
// 	)
// 	.then((res) => {
// 		console.log('拿到的结果', res);
// 		setData(res.data);
// 	})
// 	.catch((err: any) => {
// 		console.log('失败了', err);
// 	});
