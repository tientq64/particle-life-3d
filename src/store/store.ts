import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'
import { pickObject } from '../utils/utils'

export type HelperVisibility = 'hidden' | 'visible' | 'visibleWhenDragging'

export type StorableStates = {
	radius: number
	minG: number
	maxG: number
	pushBackForce: number
	zoom: number
	isCheckCollision: boolean
	isFakedDepth: boolean
	helperVisibility: HelperVisibility
	spinningSpeed: number
	soundEnabled: boolean
	soundVolume: number
	soundMaxFrequency: number
}

export type SessionStates = {
	isSpinning: boolean
	isPaused: boolean
}

export type States = StorableStates & SessionStates

export type Actions = {
	setRadius(radius: number): void
	setMinG(minG: number): void
	setMaxG(maxG: number): void
	setPushBackForce(pushBackForce: number): void
	setZoom(zoom: number): void
	setIsCheckCollision(isCheckCollision: boolean): void
	setIsFakedDepth(isFakedDepth: boolean): void
	setHelperVisibility(helperVisibility: HelperVisibility): void
	setIsPaused(isPaused: boolean): void
	setIsSpinning(isSpinning: boolean): void
	setSpinningSpeed(spinningSpeed: number): void
	setSoundEnabled(soundEnabled: boolean): void
	setSoundVolume(soundVolume: number): void
	setSoundMaxFrequency(soundMaxFrequency: number): void
	restoreToDefaultStates(): void
}

export type Store = States & Actions

export const storableStates: StorableStates = {
	radius: 240,
	minG: -30,
	maxG: 30,
	pushBackForce: 8,
	zoom: 1,
	isCheckCollision: true,
	isFakedDepth: true,
	helperVisibility: 'visibleWhenDragging',
	spinningSpeed: 0.002,
	soundEnabled: true,
	soundVolume: 0.1,
	soundMaxFrequency: 330
}

export const sessionStates: SessionStates = {
	isSpinning: true,
	isPaused: false
}

export const states: States = {
	...storableStates,
	...sessionStates
}

export const storeCreator: StateCreator<Store> = (set) => ({
	...structuredClone(states),

	setRadius(radius) {
		set({ radius })
	},

	setMinG(minG) {
		set({ minG })
	},

	setMaxG(maxG) {
		set({ maxG })
	},

	setPushBackForce(pushBackForce) {
		set({ pushBackForce })
	},

	setZoom(zoom) {
		set({ zoom })
	},

	setIsCheckCollision(isCheckCollision) {
		set({ isCheckCollision })
	},

	setIsFakedDepth(isFakedDepth) {
		set({ isFakedDepth })
	},

	setHelperVisibility(helperVisibility) {
		set({ helperVisibility })
	},

	setIsPaused(isPaused) {
		set({ isPaused })
	},

	setIsSpinning(isSpinning) {
		set({ isSpinning })
	},

	setSpinningSpeed(spinningSpeed) {
		set({ spinningSpeed })
	},

	setSoundEnabled(soundEnabled) {
		set({ soundEnabled })
	},

	setSoundVolume(soundVolume) {
		set({ soundVolume })
	},

	setSoundMaxFrequency(soundMaxFrequency) {
		set({ soundMaxFrequency })
	},

	restoreToDefaultStates() {
		set({ ...storableStates })
	}
})

export const storableStateKeys: string[] = Object.keys(storableStates)

export const useStore = create<Store>()(
	persist(storeCreator, {
		name: 'particle-life-3d:store',
		partialize: (state) => pickObject(state, storableStateKeys)
	})
)
