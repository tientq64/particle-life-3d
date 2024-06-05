import { Ellipse, Illustration, Shape, Vector, Group as ZDogGroup } from 'zdog'
import { Store, useStore } from './store/store'
import './ui'
import { switchLanguage, toggleFullscreen } from './ui'
import { clamp, randomFloat, PI_2 } from './utils/utils'

class Particle extends Shape {
	velocity: Vector = vector0.copy()
	radius: number = Number(this.stroke) / 2
}

type Group = {
	color: string
	particles: Particle[]
}

function getDistancesTwoVectors(
	vectorA: Vector,
	vectorB: Vector
): [number, number, number, number] {
	let dx = vectorA.x - vectorB.x
	let dy = vectorA.y - vectorB.y
	let dz = vectorA.z - vectorB.z
	let d = Math.sqrt(dx * dx + dy * dy + dz * dz)
	return [d, dx, dy, dz]
}

function getRandomVector(radius: number): Vector {
	const theta = 2 * Math.PI * Math.random()
	const phi = Math.acos(2 * Math.random() - 1)
	const r = Math.cbrt(Math.random()) * radius
	return new Vector({
		x: r * Math.sin(phi) * Math.cos(theta),
		y: r * Math.sin(phi) * Math.sin(theta),
		z: r * Math.cos(phi)
	})
}

function addGroup(number: number, color: string): void {
	const group: Group = {
		color,
		particles: []
	}
	for (let i = 0; i < number; i++) {
		const particle: Particle = new Particle({
			addTo: illo,
			stroke: 8,
			color: color + 'ee',
			translate: getRandomVector(store.radius)
		})
		particles.push(particle)
		group.particles.push(particle)
	}
	groups.push(group)
}

function rule(groupA: Group, groupB: Group): void {
	let g = gMaps[groupA.color][groupB.color]

	for (const particle of groupA.particles) {
		let fx = 0
		let fy = 0
		let fz = 0

		for (const particleB of groupB.particles) {
			if (particle === particleB) continue

			let [d, dx, dy, dz] = getDistancesTwoVectors(particle.translate, particleB.translate)
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

		if (store.isLimitedVelocity) {
			if (particle.velocity.magnitude() > store.maxVelocity) {
				particle.velocity.multiply(store.velocityDecreaseFactor)
			}
		}

		particle.translate.x += particle.velocity.x
		particle.translate.y += particle.velocity.y
		particle.translate.z += particle.velocity.z

		if (particle.translate.magnitude() > store.radius) {
			particle.translate.lerp(vector0, store.pushBackForce)
		}
	}
}

function separate(particleA: Particle, particleB: Particle): void {
	const [d, dx, dy, dz] = getDistancesTwoVectors(particleB.translate, particleA.translate)
	const overlap: number = particleA.radius + particleB.radius - d
	if (overlap <= 0) return
	const direction: Vector = new Vector({
		x: (dx * overlap) / 4,
		y: (dy * overlap) / 4,
		z: (dz * overlap) / 4
	})
	particleA.translate.subtract(direction)
	particleB.translate.add(direction)
}

function update(): void {
	if (!store.isPaused) {
		for (const groupA of groups) {
			for (const groupB of groups) {
				rule(groupA, groupB)
			}
		}
		if (store.isSeparated) {
			for (let i = 0; i < particles.length - 1; i++) {
				for (let j = i + 1; j < particles.length; j++) {
					separate(particles[i], particles[j])
				}
			}
		}
	}
	for (const particle of particles) {
		let rotate = particle.translate.copy().rotate(illo.rotate)
		particle.stroke = store.isFakedDepth
			? clamp(((rotate.z + store.radius) / store.radius) * 4 + 4, 4, 12)
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
			gMaps[colorA][colorB] = randomFloat(store.minG, store.maxG)
		}
	}
	for (const particle of particles) {
		particle.velocity.set(vector0)
	}
}

function updateStore(): void {
	illo.zoom = store.zoom
	helper.visible = store.helperVisibility === 'visible'
}

function resize(): void {
	illo.setSize(innerWidth, innerHeight)
}

function keydown(event: KeyboardEvent): void {
	if (event.repeat) return
	if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) return
	if (document.activeElement !== document.body) return

	switch (event.code) {
		case 'KeyR':
			randomGMaps()
			break

		case 'KeyE':
			store.setIsSeparated(!store.isSeparated)
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

		case 'KeyL':
			switchLanguage()
			break

		case 'Backquote':
			store.restoreToDefaultStates()
			break
	}
}

function wheel(event: WheelEvent): void {
	if (event.target !== illo.element) return

	store.setZoom(illo.zoom * (event.deltaY > 0 ? 0.95 : 1.05))
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
const vector0: Vector = new Vector({ x: 0, y: 0, z: 0 })
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
const gMaps: Record<string, Record<string, number>> = {}

export const illo = new Illustration({
	element: '#canvas',
	dragRotate: true,
	rotate: {
		x: -Math.PI / 8,
		y: -Math.PI / 8
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

randomGMaps()
for (const colorA of colors) {
	addGroup(75, colorA)
}

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

useStore.subscribe((state) => {
	store = state
	updateStore()
})

window.addEventListener('resize', resize)
window.addEventListener('keydown', keydown)
window.addEventListener('wheel', wheel)

updateStore()
resize()
update()
