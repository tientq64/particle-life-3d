import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import detector from 'i18next-browser-languagedetector'
import localesVi from './locales/vi.json'
import localesEn from './locales/en.json'
import localesZh from './locales/zh.json'
import localesJa from './locales/ja.json'
import dayjsViLocale from 'dayjs/locale/vi'
import dayjsEnLocale from 'dayjs/locale/en'
import dayjsZhLocale from 'dayjs/locale/zh'
import dayjsJaLocale from 'dayjs/locale/ja'
import dayjs from 'dayjs'

i18n
	.use(initReactI18next)
	.use(detector)
	.init({
		fallbackLng: 'en',
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

function handleLanguageChanged(lng: string): void {
	switch (lng) {
		case 'vi':
			dayjs.locale(dayjsViLocale)
			break
		case 'en':
			dayjs.locale(dayjsEnLocale)
			break
		case 'zh':
			dayjs.locale(dayjsZhLocale)
			break
		case 'ja':
			dayjs.locale(dayjsJaLocale)
			break
	}
}

i18n.on('languageChanged', handleLanguageChanged)
handleLanguageChanged(i18n.language)

export { i18n }
