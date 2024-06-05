import {
	Button,
	ConfigProvider,
	Form,
	InputNumber,
	List,
	Select,
	Slider,
	Space,
	Switch,
	Tag,
	ThemeConfig,
	message,
	theme
} from 'antd'
import { useEffect, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { Trans, useTranslation } from 'react-i18next'
import { i18n } from './i18n/i18n'
import { randomGMaps } from './main'
import { Store, useStore } from './store/store'
import './style.css'

const darkTheme: ThemeConfig = {
	algorithm: theme.darkAlgorithm,
	components: {
		Form: {
			itemMarginBottom: 8
		}
	}
}

export function toggleFullscreen(): void {
	if (document.fullscreenElement) {
		document.exitFullscreen()
	} else {
		document.documentElement.requestFullscreen()
	}
}

export function switchLanguage(): void {
	i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')
}

type KeyboardShortcut = {
	kbd: string | string[]
	description: string
	click?(): void
}

function App() {
	const [form] = Form.useForm()
	const store = useStore()
	const { t, i18n } = useTranslation('translations')

	const keyboardShortcuts = useMemo<KeyboardShortcut[]>(
		() => [
			{
				kbd: ['Space', 'K'],
				description: t('Tạm dừng / tiếp tục'),
				click: () => store.setIsPaused(!store.isPaused)
			},
			{
				kbd: 'R',
				description: t('Ngẫu nhiên lực, xáo trộn các hạt'),
				click: randomGMaps
			},
			{
				kbd: 'E',
				description: t('Phân tách các hạt'),
				click: () => store.setIsSeparated(!store.isSeparated)
			},
			{
				kbd: 'Q',
				description: t('Bật / tắt tự động xoay xung quanh'),
				click: () => store.setIsSpinning(!store.isSpinning)
			},
			{
				kbd: 'F',
				description: t('Toàn màn hình'),
				click: toggleFullscreen
			},
			{
				kbd: 'H',
				description: t('Hiện / ẩn đồ họa hỗ trợ'),
				click: () =>
					store.setHelperVisibility(store.helperVisibility === 'visible' ? 'hidden' : 'visible')
			},
			{
				kbd: 'L',
				description: t('Chuyển đổi ngôn ngữ'),
				click: switchLanguage
			},
			{
				kbd: '`',
				description: t('Khôi phục các tùy chọn về mặc định'),
				click: store.restoreToDefaultStates
			},
			{
				kbd: t('Chuột trái+Kéo'),
				description: t('Xoay xung quanh')
			},
			{
				kbd: t('Cuộn chuột'),
				description: t('Thu phóng')
			},
			{
				kbd: t('Chuột giữa'),
				description: t('Đặt lại thu phóng'),
				click: () => store.setZoom(1)
			}
		],
		[store, i18n.language]
	)

	const handleFormFinish = (values: Store): void => {
		useStore.setState(values)
	}

	const handleFormBlur = (): void => {
		form.submit()
	}

	useEffect(() => {
		form.setFieldValue('radius', store.radius)
	}, [store.radius])

	useEffect(() => {
		form.setFieldValue('minG', store.minG)
	}, [store.minG])

	useEffect(() => {
		form.setFieldValue('maxG', store.maxG)
	}, [store.maxG])

	useEffect(() => {
		form.setFieldValue('maxVelocity', store.maxVelocity)
	}, [store.maxVelocity])

	useEffect(() => {
		form.setFieldValue('velocityDecreaseFactor', store.velocityDecreaseFactor)
	}, [store.velocityDecreaseFactor])

	useEffect(() => {
		form.setFieldValue('pushBackForce', store.pushBackForce)
	}, [store.pushBackForce])

	useEffect(() => {
		form.setFieldValue('spinningSpeed', store.spinningSpeed)
	}, [store.spinningSpeed])

	useEffect(() => {
		setTimeout(() => {
			message.info(
				<Trans t={t}>
					Nhấn <Tag className="mr-0">R</Tag> để xáo trộn các hạt
				</Trans>,
				5
			)
		}, 2000)
	}, [])

	return (
		<ConfigProvider theme={darkTheme}>
			<div className="absolute inset-0 flex justify-between items-start pointer-events-none">
				<div className="2xl:w-[400px] xl:w-[360px] lg:w-[340px] max-h-full p-4 pr-0 overflow-x-hidden pointer-events-auto">
					<Form
						form={form}
						labelCol={{ span: 14 }}
						labelWrap
						colon={false}
						requiredMark={false}
						initialValues={store}
						onFinish={handleFormFinish}
						onBlur={handleFormBlur}
					>
						<Form.Item
							label={t('Bán kính phạm vi di chuyển')}
							name="radius"
							rules={[{ required: true }]}
						>
							<InputNumber min={10} max={999990} step={10} />
						</Form.Item>

						<Form.Item label={t('Phạm vi lực khi tạo ngẫu nhiên')}>
							<Space.Compact className="flex">
								<Form.Item name="minG" noStyle rules={[{ required: true }]}>
									<InputNumber min={-10000} max={10000} step={0.1} />
								</Form.Item>

								<Form.Item name="maxG" noStyle rules={[{ required: true }]}>
									<InputNumber min={-10000} max={10000} step={0.1} />
								</Form.Item>
							</Space.Compact>
						</Form.Item>

						<Form.Item label={t('Giới hạn vận tốc hạt')}>
							<Switch value={store.isLimitedVelocity} onChange={store.setIsLimitedVelocity} />
						</Form.Item>

						<Form.Item
							label={t('Vận tốc hạt tối đa')}
							name="maxVelocity"
							rules={[{ required: true }]}
						>
							<InputNumber min={0.1} max={10000} step={0.1} disabled={!store.isLimitedVelocity} />
						</Form.Item>

						<Form.Item
							label={t('Giảm tốc độ xuống khi đạt tối đa')}
							name="velocityDecreaseFactor"
							rules={[{ required: true }]}
						>
							<Slider
								min={0}
								max={1}
								step={0.01}
								disabled={!store.isLimitedVelocity}
								tooltip={{ formatter: (value) => `${Math.round((value || 0) * 100)}%` }}
							/>
						</Form.Item>

						<Form.Item
							label={t('Lực đẩy lại khi ngoài phạm vi di chuyển')}
							name="pushBackForce"
							rules={[{ required: true }]}
						>
							<InputNumber min={-0.004} max={1} step={0.001} />
						</Form.Item>

						<Form.Item label={t('Thu phóng')}>
							<Slider min={0.1} max={4} step={0.1} value={store.zoom} onChange={store.setZoom} />
						</Form.Item>

						<Form.Item label={t('Phân tách các hạt')}>
							<Switch value={store.isSeparated} onChange={store.setIsSeparated} />
						</Form.Item>

						<Form.Item label={t('Giả chiều sâu')}>
							<Switch value={store.isFakedDepth} onChange={store.setIsFakedDepth} />
						</Form.Item>

						<Form.Item label={t('Hiện đồ họa hỗ trợ')}>
							<Select
								popupMatchSelectWidth={false}
								value={store.helperVisibility}
								onChange={store.setHelperVisibility}
								options={[
									{ value: 'hidden', label: t('Ẩn') },
									{ value: 'visible', label: t('Hiện') },
									{ value: 'visibleWhenDragging', label: t('Chỉ hiện khi kéo') }
								]}
							/>
						</Form.Item>

						<Form.Item label={t('Tạm dừng')}>
							<Switch value={store.isPaused} onChange={store.setIsPaused} />
						</Form.Item>

						<Form.Item label={t('Tự động xoay xung quanh')}>
							<Switch value={store.isSpinning} onChange={store.setIsSpinning} />
						</Form.Item>

						<Form.Item
							label={t('Tốc độ tự động xoay xung quanh')}
							name="spinningSpeed"
							rules={[{ required: true }]}
						>
							<InputNumber min={0.001} max={1} step={0.001} disabled={!store.isSpinning} />
						</Form.Item>

						<Form.Item label="Language">
							<Select
								popupMatchSelectWidth={false}
								value={i18n.language}
								onChange={(value) => i18n.changeLanguage(value)}
								options={[
									{ value: 'en', label: 'English' },
									{ value: 'vi', label: 'Tiếng Việt' },
									{ value: 'zh', label: '中国人' },
									{ value: 'ja', label: '日本語' }
								]}
							/>
						</Form.Item>

						<Form.Item hidden>
							<Button htmlType="submit" />
						</Form.Item>
					</Form>
				</div>

				<div className="2xl:w-[400px] xl:w-[360px] lg:w-[340px] max-h-full p-4 pl-0 2xl:pr-6 xl:pr-4 overflow-x-hidden pointer-events-auto">
					<List
						size="small"
						dataSource={keyboardShortcuts}
						renderItem={(item) => (
							<List.Item
								key={item.description}
								className={item.click ? 'hover:bg-gray-700/30 cursor-pointer' : ''}
								onClick={item.click}
							>
								<List.Item.Meta
									className="flex"
									avatar={
										<div className="w-32 text-right">
											{(Array.isArray(item.kbd) ? item.kbd : [item.kbd]).flatMap((kbd) => [
												<Tag key={kbd}>{kbd}</Tag>
											])}
										</div>
									}
									description={item.description}
								/>
							</List.Item>
						)}
					/>
				</div>

				<div className="absolute 2xl:right-6 xl:right-4 bottom-2 text-sm pointer-events-auto">
					<a
						className="text-sky-400"
						href="https://www.flaticon.com/free-icons/quantum"
						title="quantum icons"
						target="_blank"
					>
						Quantum icons created by Vlad Szirka - Flaticon
					</a>
				</div>
			</div>
		</ConfigProvider>
	)
}

createRoot(document.getElementById('root')!).render(<App />)
