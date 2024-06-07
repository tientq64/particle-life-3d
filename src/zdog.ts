import { Vector } from 'zdog'

declare module 'zdog' {
	interface Vector {
		isSame(vector: Vector): boolean
		isZero(): boolean
		add2(position: Vector): this
		subtract2(position: Vector): this
		scale(factor: number): this
		round(): this
	}
}

Vector.prototype.isZero = function () {
	return this.x === 0 && this.y === 0 && this.z === 0
}

Vector.prototype.add2 = function (position) {
	this.x += position.x || 0
	this.y += position.y || 0
	this.z += position.z || 0
	return this
}

Vector.prototype.subtract2 = function (position) {
	this.x -= position.x || 0
	this.y -= position.y || 0
	this.z -= position.z || 0
	return this
}

Vector.prototype.scale = function (factor) {
	this.x *= factor
	this.y *= factor
	this.z *= factor
	return this
}

Vector.prototype.round = function () {
	this.x = Math.round(this.x)
	this.y = Math.round(this.y)
	this.z = Math.round(this.z)
	return this
}

export { Vector }
