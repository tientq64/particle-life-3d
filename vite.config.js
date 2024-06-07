import { defineConfig } from 'vite'

export default defineConfig({
	server: {
		port: 5500
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					general: ['antd/es/button'],
					layout: ['antd/es/divider'],
					dataEntry: [
						'antd/es/form',
						'antd/es/input',
						'antd/es/input-number',
						'antd/es/select',
						'antd/es/switch',
						'antd/es/slider'
					],
					dataDisplay: ['antd/es/list', 'antd/es/tag', 'antd/es/tooltip'],
					feedback: ['antd/es/message'],
					other: ['antd/es/config-provider']
				}
			}
		}
	}
})
