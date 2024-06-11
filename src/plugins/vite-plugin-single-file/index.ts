import { JSDOM } from 'jsdom'
import { extname } from 'path'
import { OutputAsset, OutputChunk } from 'rollup'
import { PluginOption } from 'vite'

export function viteSingleFile(): PluginOption {
	return {
		name: 'single-file',
		apply: 'build',
		enforce: 'post',

		generateBundle(_, bundle) {
			let htmlAsset!: OutputAsset

			for (const fileName in bundle) {
				const asset = bundle[fileName] as OutputAsset
				if (/\.html?/.test(fileName)) {
					htmlAsset = asset
					break
				}
			}
			if (htmlAsset === undefined) return

			const dom = new JSDOM(htmlAsset.source)
			const { document } = dom.window

			for (const fileName in bundle) {
				const assetOrChunk = bundle[fileName]

				if (/\.[mc]?js$/.test(fileName)) {
					const asset = assetOrChunk as OutputChunk
					const selector: string = `script[src="/${fileName}"]`
					const el = document.querySelector(selector) as HTMLScriptElement | null
					if (el === null) break
					const newEl = el.cloneNode() as HTMLScriptElement
					el.remove()
					newEl.removeAttribute('src')
					newEl.text = `\n${asset.code}\n`
					document.body.insertAdjacentElement('beforeend', newEl)
					delete bundle[fileName]
				}
				//
				else if (/\.css$/.test(fileName)) {
					const asset = assetOrChunk as OutputAsset
					const selector: string = `link[href="/${fileName}"]`
					const el = document.querySelector(selector) as HTMLLinkElement | null
					if (el === null) break
					el.outerHTML = `<style>\n${asset.source}\n</style>`
					delete bundle[fileName]
				}
				//
				else if (/\.(png|jpe?g|webp|ico)$/.test(fileName)) {
					const asset = assetOrChunk as OutputAsset
					const selector: string = `link[href="/${fileName}"]`
					const el = document.querySelector(selector) as HTMLLinkElement | null
					if (el === null) break
					const ext: string = extname(fileName).substring(1)
					el.href = `data:image/${ext};base64,${(asset.source as Buffer).toString('base64')}`
					delete bundle[fileName]
				}
			}

			htmlAsset.source = dom.serialize()
		}
	}
}
