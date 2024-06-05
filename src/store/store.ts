import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'
import { pickObject } from '../utils/utils'

export type HelperVisibility = 'hidden' | 'visible' | 'visibleWhenDragging'

export type StorableStates = {
	radius: number
	minG: number
	maxG: number
	isLimitedVelocity: boolean
	maxVelocity: number
	velocityDecreaseFactor: number
	pushBackForce: number
	zoom: number
	isSeparated: boolean
	isFakedDepth: boolean
	helperVisibility: HelperVisibility
	isPaused: boolean
	isSpinning: boolean
	spinningSpeed: number
}

export type Actions = {
	setRadius(radius: number): void
	setMinG(minG: number): void
	setMaxG(maxG: number): void
	setIsLimitedVelocity(isLimitedVelocity: boolean): void
	setMaxVelocity(maxVelocity: number): void
	setVelocityDecreaseFactor(velocityDecreaseFactor: number): void
	setPushBackForce(pushBackForce: number): void
	setZoom(zoom: number): void
	setIsSeparated(isSeparated: boolean): void
	setIsFakedDepth(isFakedDepth: boolean): void
	setHelperVisibility(helperVisibility: HelperVisibility): void
	setIsPaused(isPaused: boolean): void
	setIsSpinning(isSpinning: boolean): void
	setSpinningSpeed(spinningSpeed: number): void
	restoreToDefaultStates(): void
}

export type Store = StorableStates & Actions

export const storableStates: StorableStates = {
	radius: 240,
	minG: -0.3,
	maxG: 0.3,
	isLimitedVelocity: false,
	maxVelocity: 1,
	velocityDecreaseFactor: 0.1,
	pushBackForce: 0.008,
	zoom: 1,
	isSeparated: true,
	isFakedDepth: true,
	helperVisibility: 'visibleWhenDragging',
	isPaused: false,
	isSpinning: true,
	spinningSpeed: 0.002
}

export const storeCreator: StateCreator<Store> = (set) => ({
	...structuredClone(storableStates),

	setRadius(radius) {
		set({ radius })
	},

	setMinG(minG) {
		set({ minG })
	},

	setMaxG(maxG) {
		set({ maxG })
	},

	setIsLimitedVelocity(isLimitedVelocity) {
		set({ isLimitedVelocity })
	},

	setMaxVelocity(maxVelocity) {
		set({ maxVelocity })
	},

	setVelocityDecreaseFactor(velocityDecreaseFactor) {
		set({ velocityDecreaseFactor })
	},

	setPushBackForce(pushBackForce) {
		set({ pushBackForce })
	},

	setZoom(zoom) {
		set({ zoom })
	},

	setIsSeparated(isSeparated) {
		set({ isSeparated })
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
