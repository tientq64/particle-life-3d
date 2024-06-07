import { Effects, Sound } from 'pizzicato'
import { Anchor, Ellipse, Illustration, Shape, Group as ZDogGroup } from 'zdog'
import { Snapshot, Store, useStore } from './store/store'
import { switchLanguage, toggleFullscreen } from './ui'
import { PI_2, clamp, randomInt } from './utils/utils'
import { Vector } from './zdog'

export class Particle extends Shape {
	velocity: Vector = vector0.copy()
	radius: number = Number(this.stroke) / 2
}

export type Group = {
	color: string
	particles: Particle[]
}

export type GMaps = Record<string, Record<string, number>>

function getDistancesBetweenTwoVectors(
	vectorA: Vector,
	vectorB: Vector
): [number, number, number, number] {
	let dx = vectorA.x - vectorB.x
	let dy = vectorA.y - vectorB.y
	let dz = vectorA.z - vectorB.z
	let d = Math.sqrt(dx * dx + dy * dy + dz * dz)
	return [d, dx, dy, dz]
}

function getRandomVectorInSphere(radius: number): Vector {
	const theta = 2 * Math.PI * Math.random()
	const phi = Math.acos(2 * Math.random() - 1)
	const r = Math.cbrt(Math.random()) * radius
	return new Vector({
		x: r * Math.sin(phi) * Math.cos(theta),
		y: r * Math.sin(phi) * Math.sin(theta),
		z: r * Math.cos(phi)
	}).round()
}

function addGroup(number: number, color: string): void {
	const group: Group = {
		color,
		particles: []
	}
	for (let i = 0; i < number; i++) {
		const particle: Particle = new Particle({
			addTo: particlesAnchor,
			stroke: 8,
			color: color + 'ee',
			translate: getRandomVectorInSphere(store.radius)
		})
		particles.push(particle)
		group.particles.push(particle)
	}
	groups.push(group)
}

function rule(groupA: Group, groupB: Group): void {
	let g = gMaps[groupA.color][groupB.color] / 100

	for (const particle of groupA.particles) {
		let fx = 0
		let fy = 0
		let fz = 0

		for (const particleB of groupB.particles) {
			if (particle === particleB) continue

			let [d, dx, dy, dz] = getDistancesBetweenTwoVectors(particle.translate, particleB.translate)
			if (d && d >= 0 && d <= 400) {
				let f = (g * 1) / d
				fx += f * dx
				fy += f * dy
				fz += f * dz
			}
		}
		particle.velocity.x = (particle.velocity.x + fx) * 0.5
		particle.velocity.y = (particle.velocity.y + fy) * 0.5
		particle.velocity.z = (particle.velocity.z + fz) * 0.5

		particle.translate.x += particle.velocity.x
		particle.translate.y += particle.velocity.y
		particle.translate.z += particle.velocity.z

		if (particle.translate.magnitude() > store.radius) {
			particle.translate.lerp(vector0, store.pushBackForce / 1000)
		}
	}
}

function collide(particleA: Particle, particleB: Particle): boolean {
	const [d, dx, dy, dz] = getDistancesBetweenTwoVectors(particleB.translate, particleA.translate)
	const overlap: number = particleA.radius + particleB.radius - d
	if (overlap <= 0) return false
	let x = (dx * overlap) / 4
	let y = (dy * overlap) / 4
	let z = (dz * overlap) / 4
	particleA.translate.x -= x
	particleA.translate.y -= y
	particleA.translate.z -= z
	particleB.translate.x += x
	particleB.translate.y += y
	particleB.translate.z += z
	return true
}

function update(): void {
	if (!store.soundSmoothed) {
		sound.frequency = 0
	}
	if (!store.isPaused) {
		for (const groupA of groups) {
			for (const groupB of groups) {
				rule(groupA, groupB)
			}
		}
		if (store.isCheckCollision) {
			let count = 0
			let pan = 0
			let volume = 0
			for (let i = 0; i < particles.length - 1; i++) {
				const particleA = particles[i]
				for (let j = i + 1; j < particles.length; j++) {
					const particleB = particles[j]
					const isCollided = collide(particleA, particleB)
					if (isCollided) {
						let translateA: Vector = particleA.translate.copy().rotate(illo.rotate)
						let translateB: Vector = particleB.translate.copy().rotate(illo.rotate)
						pan += (translateA.x + translateB.x) / store.radius / 2
						volume += (translateA.z + translateB.z) / store.radius / 2
						count++
					}
				}
			}
			stereoPanner.pan = clamp(pan / count, -1, 1)
			sound.frequency = (count / (particles.length * 2)) * store.soundMaxFrequency
			if (store.soundEnabled) {
				sound.volume = clamp((volume / count + 1) / 2, 0, 1) * store.soundVolume
			}
		}
	}
	for (const particle of particles) {
		let translate: Vector = particle.translate.copy().rotate(illo.rotate)
		particle.stroke = store.isFakedDepth
			? clamp(((translate.z + store.radius) / store.radius) * 4 + 4, 4, 12)
			: 8
	}
	if (store.isSpinning) {
		illo.rotate.y -= store.spinningSpeed
	}
	illo.updateRenderGraph()
	requestAnimationFrame(update)
}

export function randomGMaps(): void {
	for (const colorA of colors) {
		gMaps[colorA] = {}
		for (const colorB of colors) {
			gMaps[colorA][colorB] = randomInt(store.minG, store.maxG)
		}
	}
	for (const particle of particles) {
		particle.translate.round()
		particle.velocity.scale(0)
	}
	captureSnapshot()
}

function updateStore(): void {
	illo.zoom = store.zoom
	helper.visible = store.helperVisibility === 'visible'
	sound.volume = store.soundEnabled ? store.soundVolume : 0
}

export function captureSnapshot(): void {
	if (store.isPaused) return
	const snapshot: Snapshot = store.makeSnapshot(store, gMaps, groups)
	store.pushSnapshot(snapshot)
}

export function applySnapshot(snapshot: Snapshot): void {
	store.setRadius(snapshot.radius)
	store.setPushBackForce(snapshot.pushBackForce)
	store.setIsCheckCollision(snapshot.isCheckCollision)
	setTimeout(() => {
		for (const colorA of colors) {
			for (const colorB of colors) {
				gMaps[colorA][colorB] = snapshot.gMaps[colorA][colorB]
			}
		}
		for (const particle of particles) {
			particle.remove()
		}
		particles.splice(0)
		groups.splice(0)
		for (const groupSnapshot of snapshot.groups) {
			const group: Group = {
				color: groupSnapshot.color,
				particles: []
			}
			for (const particleSnapshot of groupSnapshot.particles) {
				const particle: Particle = new Particle({
					addTo: particlesAnchor,
					stroke: particleSnapshot.radius * 2,
					color: group.color + 'ee',
					translate: { ...particleSnapshot.translate }
				})
				if (particleSnapshot.velocity) {
					particle.velocity.add2(particleSnapshot.velocity)
				}
				particles.push(particle)
				group.particles.push(particle)
			}
			groups.push(group)
		}
		particlesAnchor.updateGraph()
	})
}

function handleGlobalResize(): void {
	illo.setSize(innerWidth, innerHeight)
}

function handleGlobalPointerDown(): void {
	sound.play()
}

function handleGlobalKeyDown(event: KeyboardEvent): void {
	if (event.repeat) return
	sound.play()
	if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) return
	if (document.activeElement !== document.body) return

	switch (event.code) {
		case 'KeyR':
			randomGMaps()
			break

		case 'KeyC':
			store.setIsCheckCollision(!store.isCheckCollision)
			break

		case 'KeyQ':
			store.setIsSpinning(!store.isSpinning)
			break

		case 'KeyF':
			toggleFullscreen()
			break

		case 'Space':
		case 'KeyK':
			store.setIsPaused(!store.isPaused)
			break

		case 'KeyH':
			store.setHelperVisibility(store.helperVisibility === 'visible' ? 'hidden' : 'visible')
			break

		case 'KeyM':
			store.setSoundEnabled(!store.soundEnabled)
			break

		case 'KeyL':
			switchLanguage()
			break

		case 'Backquote':
			store.resetToDefaultStates()
			break
	}
}

function handleGlobalWheel(event: WheelEvent): void {
	if (event.target !== illo.element) return

	store.setZoom(illo.zoom * (event.deltaY > 0 ? 0.95 : 1.05))
}

function handleGlobalVisibilityChange(): void {
	if (document.hidden) {
		sound.pause()
	} else {
		sound.play()
	}
}

function handleCanvasPointerDown(event: MouseEvent): void {
	;(document.activeElement as HTMLElement).blur()
	switch (event.button) {
		case 0:
			store.setIsSpinning(false)
			break

		case 1:
			store.setZoom(1)
			break
	}
}

let store: Store = useStore.getState()
export const vector0: Vector = new Vector({ x: 0, y: 0, z: 0 })
const particles: Particle[] = []
const groups: Group[] = []
const colors: string[] = [
	'#fb7185',
	'#fb923c',
	'#facc15',
	'#4ade80',
	'#22d3ee',
	'#60a5fa',
	'#a78bfa',
	'#e879f9',
	'#ffffff',
	'#94a3b8'
]
const gMaps: GMaps = {}

export const illo = new Illustration({
	element: '#canvas',
	dragRotate: true,
	rotate: {
		x: -Math.PI / 8,
		y: Math.PI / 4
	},
	onDragStart: () => {
		illo.element.classList.add('cursor-move')
	},
	onDragMove: () => {
		if (store.helperVisibility === 'visibleWhenDragging') {
			helper.visible = true
		}
		illo.rotate.x = clamp(illo.rotate.x, -PI_2, PI_2)
	},
	onDragEnd: () => {
		if (store.helperVisibility === 'visibleWhenDragging') {
			helper.visible = false
		}
		illo.element.classList.remove('cursor-move')
	}
})
illo.element = illo.element as HTMLCanvasElement
illo.element.addEventListener('pointerdown', handleCanvasPointerDown)

const particlesAnchor = new Anchor({
	addTo: illo
})

export const helper = new ZDogGroup({
	addTo: illo
})
new Shape({
	addTo: helper,
	stroke: 4,
	color: '#02061766',
	path: [{ x: 0 }, { x: store.radius * 0.75 }]
})
new Ellipse({
	addTo: helper,
	diameter: store.radius * 1.5,
	rotate: {
		x: Math.PI / 2
	},
	fill: false,
	stroke: 4,
	color: '#02061766'
})
new Ellipse({
	addTo: helper,
	diameter: store.radius * 1.5,
	rotate: {
		x: Math.PI / 2
	},
	fill: true,
	color: '#00000000',
	backface: '#02061733'
})

const sound = new Sound({
	source: 'wave',
	options: {
		type: 'sine',
		attack: 0,
		release: 0,
		volume: 0.05
	}
})

const stereoPanner = new Effects.StereoPanner()
sound.addEffect(stereoPanner)

for (const colorA of colors) {
	addGroup(75, colorA)
}

useStore.subscribe((state) => {
	store = state
	updateStore()
})

window.addEventListener('resize', handleGlobalResize)
window.addEventListener('pointerdown', handleGlobalPointerDown)
window.addEventListener('keydown', handleGlobalKeyDown)
window.addEventListener('wheel', handleGlobalWheel)
window.addEventListener('visibilitychange', handleGlobalVisibilityChange)

updateStore()
handleGlobalResize()
randomGMaps()
update()
