import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import detector from 'i18next-browser-languagedetector'
import localesVi from './locales/vi.json'
import localesEn from './locales/en.json'
import localesZh from './locales/zh.json'
import localesJa from './locales/ja.json'

i18n
	.use(initReactI18next)
	.use(detector)
	.init({
		fallbackLng: 'vi',
		debug: true,
		interpolation: {
			escapeValue: false
		},
		resources: {
			vi: {
				translations: localesVi
			},
			en: {
				translations: localesEn
			},
			zh: {
				translations: localesZh
			},
			ja: {
				translations: localesJa
			}
		}
	})

export { i18n }
