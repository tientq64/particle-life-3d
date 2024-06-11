import { defineConfig } from 'vite'
import { viteSingleFile } from './src/plugins/vite-plugin-single-file'

export default defineConfig({
	server: {
		port: 5500
	},
	build: {
		assetsInlineLimit: 1048576
	},
	plugins: [viteSingleFile()]
})
