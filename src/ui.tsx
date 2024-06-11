import {
	Button,
	ConfigProvider,
	Divider,
	Form,
	InputNumber,
	List,
	Select,
	Slider,
	Space,
	Switch,
	Tag,
	ThemeConfig,
	Tooltip,
	message,
	theme
} from 'antd'
import dayjs from 'dayjs'
import dayjsRelativeTimePlugin from 'dayjs/plugin/relativeTime'
import { saveAs } from 'file-saver'
import { compressToUTF16, decompressFromUTF16 } from 'lz-string'
import 'material-icons/iconfont/round.css'
import { MouseEvent, useEffect, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { Trans, useTranslation } from 'react-i18next'
import { Icon } from './components/Icon'
import { i18n } from './i18n/i18n'
import { applySnapshot, randomGMaps } from './main'
import { Snapshot, Store, useStore } from './store/store'
import './style.css'

dayjs.extend(dayjsRelativeTimePlugin)

const antdTheme: ThemeConfig = {
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

export function stringifySnapshot(snapshot: Snapshot): string {
	const json: string = JSON.stringify(snapshot)
	const lzstr: string = compressToUTF16(json)
	return lzstr
}

export function parseSnapshot(lzstr: string): Snapshot {
	try {
		const json: string | null = decompressFromUTF16(lzstr)
		if (json === null) throw null
		const snapshot: Snapshot = JSON.parse(json)
		return snapshot
	} catch {
		throw Error(i18n.t('Dữ liệu bản ghi không hợp lệ'))
	}
}

export function copySnapshotToClipboard(snapshot: Snapshot): Promise<void> {
	const lzstr: string = stringifySnapshot(snapshot)
	return navigator.clipboard.writeText(lzstr)
}

export function downloadSnapshot(snapshot: Snapshot): void {
	const lzstr: string = stringifySnapshot(snapshot)
	const blob: Blob = new Blob([lzstr])
	saveAs(blob, `particle-life-3d-snapshot-${snapshot.id}.txt`)
}

function importSnapshot(lzstr: string): void {
	try {
		const snapshot: Snapshot = parseSnapshot(lzstr)
		applySnapshot(snapshot)
	} catch (err: any) {
		message.error(String(err))
	}
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

	const handleCopySnapshot = (snapshot: Snapshot, event: MouseEvent): void => {
		event.stopPropagation()
		copySnapshotToClipboard(snapshot)
		message.info(t('Đã lưu bản ghi vào khay nhớ tạm'))
	}

	const handleDownloadSnapshot = (snapshot: Snapshot, event: MouseEvent): void => {
		event.stopPropagation()
		downloadSnapshot(snapshot)
	}

	const uploadSnapshot = (): void => {
		const inputEl = document.createElement('input')
		inputEl.type = 'file'
		inputEl.accept = 'text/plain'
		inputEl.addEventListener('change', () => {
			if (inputEl.files) {
				inputEl.files[0].text().then(importSnapshot)
			}
		})
		inputEl.click()
	}

	const pasteSnapshot = (): void => {
		navigator.clipboard.readText().then(importSnapshot)
	}

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
				kbd: 'C',
				description: t('Kiểm tra va chạm các hạt'),
				click: () => store.setIsCheckCollision(!store.isCheckCollision)
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
				kbd: 'M',
				description: t('Bật / tắt âm thanh'),
				click: () => store.setSoundEnabled(!store.soundEnabled)
			},
			{
				kbd: 'L',
				description: t('Chuyển đổi ngôn ngữ'),
				click: switchLanguage
			},
			{
				kbd: '`',
				description: t('Khôi phục các tùy chọn về mặc định'),
				click: store.resetToDefaultStates
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
		form.setFieldValue('maxInteractionDistance', store.maxInteractionDistance)
	}, [store.maxInteractionDistance])

	useEffect(() => {
		form.setFieldValue('pushBackForce', store.pushBackForce)
	}, [store.pushBackForce])

	useEffect(() => {
		form.setFieldValue('spinningSpeed', store.spinningSpeed)
	}, [store.spinningSpeed])

	useEffect(() => {
		setTimeout(async () => {
			await message.info(t('Nhấn chuột vào trang web để có thể nghe thấy âm thanh'), 10)
			await message.info(
				<Trans t={t}>
					Nhấn <Tag className="mr-0">R</Tag> để xáo trộn các hạt
				</Trans>,
				5
			)
		}, 2000)
	}, [])

	return (
		<ConfigProvider theme={antdTheme}>
			<div className="absolute inset-0 flex justify-between items-start pointer-events-none">
				<div className="flex flex-col 2xl:w-[400px] xl:w-[360px] w-[340px] h-full p-4 pb-2 pr-2 overflow-x-hidden pointer-events-auto">
					<Divider className="!m-0 !mb-2">{t('Bảng điều khiển')}</Divider>

					<div className="flex-1 overflow-x-hidden scrollbar-thin">
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
										<InputNumber min={-10000} max={10000} />
									</Form.Item>

									<Form.Item name="maxG" noStyle rules={[{ required: true }]}>
										<InputNumber min={-10000} max={10000} />
									</Form.Item>
								</Space.Compact>
							</Form.Item>

							<Form.Item
								label={t('Khoảng cách tương tác giữa các hạt')}
								name="maxInteractionDistance"
								rules={[{ required: true }]}
							>
								<InputNumber min={0} max={999990} />
							</Form.Item>

							<Form.Item
								label={t('Lực đẩy lại khi ngoài phạm vi di chuyển')}
								name="pushBackForce"
								rules={[{ required: true }]}
							>
								<InputNumber min={-4} max={1000} />
							</Form.Item>

							<Form.Item label={t('Thu phóng')}>
								<Slider min={0.1} max={4} step={0.1} value={store.zoom} onChange={store.setZoom} />
							</Form.Item>

							<Form.Item label={t('Kiểm tra va chạm các hạt')}>
								<Switch value={store.isCheckCollision} onChange={store.setIsCheckCollision} />
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

							<Form.Item label={t('Bật âm thanh')}>
								<Switch value={store.soundEnabled} onChange={store.setSoundEnabled} />
							</Form.Item>

							<Form.Item label={t('Âm lượng')}>
								<Slider
									min={0}
									max={1}
									step={0.01}
									disabled={!store.soundEnabled}
									tooltip={{ formatter: (value) => `${Math.round((value || 0) * 100)}%` }}
									value={store.soundVolume}
									onChange={store.setSoundVolume}
								/>
							</Form.Item>

							<Form.Item label={t('Âm thanh mượt mà')}>
								<Switch value={store.soundSmoothed} onChange={store.setSoundSmoothed} />
							</Form.Item>

							<Form.Item label={t('Cao độ âm thanh')}>
								<Slider
									min={110}
									max={880}
									step={10}
									disabled={!store.soundEnabled}
									tooltip={{ formatter: (value) => `${value} Hz` }}
									value={store.soundMaxFrequency}
									onChange={store.setSoundMaxFrequency}
								/>
							</Form.Item>

							<Form.Item label="Nhập bản ghi">
								<Button.Group>
									<Button onClick={() => uploadSnapshot()}>Tải lên</Button>
									<Button onClick={() => pasteSnapshot()}>Dán</Button>
								</Button.Group>
							</Form.Item>

							<Form.Item label="Language / Ngôn ngữ">
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

					<ul className="flex text-sm">
						<li>
							<Tooltip title="github.com/tientq64/particle-life-3d">
								<a
									className="text-sky-400"
									href="https://github.com/tientq64/particle-life-3d"
									target="_blank"
								>
									GitHub
								</a>
							</Tooltip>
							<Divider type="vertical" />

							<a
								className="text-sky-400"
								href="https://github.com/tientq64/particle-life-3d/blob/main/CHANGELOG.md"
								target="_blank"
							>
								Changelog
							</a>
							<Divider type="vertical" />

							<a
								className="text-sky-400"
								href="https://github.com/tientq64/particle-life-3d/issues/new"
								target="_blank"
							>
								{t('Báo cáo vấn đề')}
							</a>
							<Divider type="vertical" />

							<a
								className="text-sky-400"
								href="https://github.com/tientq64/particle-life-3d?tab=readme-ov-file#-support-me"
								target="_blank"
							>
								Buy me a coffee
							</a>
						</li>
					</ul>
				</div>

				<div className="flex flex-col 2xl:w-[400px] xl:w-[360px] w-[340px] h-full p-4 pb-2 pl-2 2xl:pr-6 xl:pr-4 pointer-events-auto">
					<Divider className="!m-0">{t('Phím tắt')}</Divider>

					<div className="h-2/3 overflow-x-hidden scrollbar-thin">
						<List
							size="small"
							dataSource={keyboardShortcuts}
							renderItem={(keyboardShortcut) => (
								<List.Item
									key={keyboardShortcut.description}
									className={keyboardShortcut.click ? 'hover:bg-gray-700/30 cursor-pointer' : ''}
									onClick={keyboardShortcut.click}
								>
									<List.Item.Meta
										className="flex"
										avatar={
											<div className="w-32 text-right">
												{(Array.isArray(keyboardShortcut.kbd)
													? keyboardShortcut.kbd
													: [keyboardShortcut.kbd]
												).flatMap((kbd) => [<Tag key={kbd}>{kbd}</Tag>])}
											</div>
										}
										description={keyboardShortcut.description}
									/>
								</List.Item>
							)}
						/>
					</div>

					<Divider className="!m-0">{t('Lịch sử')}</Divider>

					<div className="h-1/3 overflow-x-hidden scrollbar-thin">
						<List
							size="small"
							dataSource={store.snapshots.toReversed()}
							renderItem={(snapshot) => (
								<List.Item
									key={snapshot.id}
									className="flex items-center hover:bg-gray-700/30 cursor-pointer"
									onClick={() => applySnapshot(snapshot)}
								>
									<div className="flex-1">{snapshot.id.substring(0, 7)}</div>
									<div className="flex gap-1 items-center">
										<Button
											type="text"
											icon={<Icon name="copy" />}
											onClickCapture={(event) => handleCopySnapshot(snapshot, event)}
										/>

										<Button
											type="text"
											icon={<Icon name="download" />}
											onClick={(event) => handleDownloadSnapshot(snapshot, event)}
										/>
									</div>
								</List.Item>
							)}
						/>
					</div>

					<Tooltip title="flaticon.com/free-icons/quantum">
						<a
							className="text-sm text-right text-sky-400"
							href="https://www.flaticon.com/free-icons/quantum"
							target="_blank"
						>
							Quantum icons created by Vlad Szirka - Flaticon
						</a>
					</Tooltip>
				</div>
			</div>
		</ConfigProvider>
	)
}

createRoot(document.getElementById('root')!).render(<App />)
