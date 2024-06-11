import { nanoid } from 'nanoid'
import { Vector } from 'zdog'
import { StateCreator, create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GMaps, Group } from '../main'
import { pickObject } from '../utils/utils'

export type HelperVisibility = 'hidden' | 'visible' | 'visibleWhenDragging'

export type StorableStates = {
	radius: number
	minG: number
	maxG: number
	maxInteractionDistance: number
	pushBackForce: number
	zoom: number
	isCheckCollision: boolean
	isFakedDepth: boolean
	helperVisibility: HelperVisibility
	spinningSpeed: number
	soundEnabled: boolean
	soundVolume: number
	soundSmoothed: boolean
	soundMaxFrequency: number
}

export type SessionStates = {
	isSpinning: boolean
	isPaused: boolean
	snapshots: Snapshot[]
}

export type States = StorableStates & SessionStates

export type Actions = {
	setRadius(radius: number): void
	setMinG(minG: number): void
	setMaxG(maxG: number): void
	setMaxInteractionDistance(maxInteractionDistance: number): void
	setPushBackForce(pushBackForce: number): void
	setZoom(zoom: number): void
	setIsCheckCollision(isCheckCollision: boolean): void
	setIsFakedDepth(isFakedDepth: boolean): void
	setHelperVisibility(helperVisibility: HelperVisibility): void
	setSpinningSpeed(spinningSpeed: number): void
	setSoundEnabled(soundEnabled: boolean): void
	setSoundVolume(soundVolume: number): void
	setSoundSmoothed(soundSmoothed: boolean): void
	setSoundMaxFrequency(soundMaxFrequency: number): void
	setIsSpinning(isSpinning: boolean): void
	setIsPaused(isPaused: boolean): void
	makeSnapshot(store: Store, gMaps: GMaps, groups: Group[]): Snapshot
	pushSnapshot(snapshot: Snapshot): void
	resetToDefaultStates(): void
}

export type Store = States & Actions

export type Snapshot = {
	id: string
	createdTime: string
	radius: number
	minG: number
	maxG: number
	maxInteractionDistance: number
	pushBackForce: number
	isCheckCollision: boolean
	gMaps: GMaps
	groups: GroupSnapshot[]
}

export type GroupSnapshot = {
	color: string
	particles: ParticleSnapshot[]
}

export type ParticleSnapshot = {
	radius: number
	translate: Vector
	velocity?: Vector
}

export const storableStates: StorableStates = {
	radius: 240,
	minG: -30,
	maxG: 30,
	maxInteractionDistance: 400,
	pushBackForce: 8,
	zoom: 1,
	isCheckCollision: true,
	isFakedDepth: true,
	helperVisibility: 'visibleWhenDragging',
	spinningSpeed: 0.002,
	soundEnabled: true,
	soundVolume: 0.2,
	soundSmoothed: false,
	soundMaxFrequency: 660
}

export const sessionStates: SessionStates = {
	isSpinning: true,
	isPaused: false,
	snapshots: []
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

	setMaxInteractionDistance(maxInteractionDistance) {
		set({ maxInteractionDistance })
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

	setSpinningSpeed(spinningSpeed) {
		set({ spinningSpeed })
	},

	setSoundEnabled(soundEnabled) {
		set({ soundEnabled })
	},

	setSoundVolume(soundVolume) {
		set({ soundVolume })
	},

	setSoundSmoothed(soundSmoothed) {
		set({ soundSmoothed })
	},

	setSoundMaxFrequency(soundMaxFrequency) {
		set({ soundMaxFrequency })
	},

	setIsSpinning(isSpinning) {
		set({ isSpinning })
	},

	setIsPaused(isPaused) {
		set({ isPaused })
	},

	makeSnapshot(store, gMaps, groups) {
		const snapshot: Snapshot = {
			id: nanoid(),
			createdTime: new Date().toJSON(),
			radius: store.radius,
			minG: store.minG,
			maxG: store.maxG,
			maxInteractionDistance: store.maxInteractionDistance,
			isCheckCollision: store.isCheckCollision,
			pushBackForce: store.pushBackForce,
			gMaps: structuredClone(gMaps),
			groups: groups.map((group) => ({
				color: group.color,
				particles: group.particles.map<ParticleSnapshot>((particle) => ({
					radius: particle.radius,
					translate: particle.translate.copy(),
					velocity: particle.velocity.isZero() ? undefined : particle.velocity.copy()
				}))
			}))
		}
		return snapshot
	},

	pushSnapshot(snapshot) {
		set((state) => {
			const snapshots: Snapshot[] = [...state.snapshots, snapshot]
			if (snapshots.length > 10) snapshots.shift()
			return { snapshots }
		})
	},

	resetToDefaultStates() {
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
