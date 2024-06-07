import { defineConfig } from 'vite'

export default defineConfig({
	server: {
		port: 5500
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					antd: ['antd']
				}
			}
		}
	}
})
