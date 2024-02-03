import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
	plugins: [react()],

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	//
	// 1. prevent vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 1420,
		strictPort: true,
		watch: {
			// 3. tell vite to ignore watching `src-tauri`
			ignored: ['**/src-tauri/**'],
		},
		open: true,
		cors: true,
		proxy: {
			'/api': {
				target: 'https://openapi.baidu.com',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ''),
			},
			// /baidu/
			'/baidu': {
				target: 'https://pan.baidu.com',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/baidu/, ''),
			},
			'/pcsbaidu': {
				target: 'https://d.pcs.baidu.com',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/pcsbaidu/, ''),
			},
		},
	},
}));
// https://openapi.baidu.com/oauth/2.0/authorize?response_type=code&client_id=xLP7hrgkoiO3skwxZEgVivGKqyHf11z5&redirect_uri=oob&scope=basic,netdisk&device_id=48614894
// 授权码  9f59e0e92b57a18c3abc9b84f4f25810
