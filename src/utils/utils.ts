export type KeyValuePair = Record<string, any>

export const PI_2: number = Math.PI / 2

export function clamp(val: number, min: number, max: number): number {
	if (val < min) return min
	if (val > max) return max
	return val
}

export function randomFloat(min: number, max: number): number {
	return min + Math.random() * (max - min)
}

export function randomInt(min: number, max: number): number {
	return min + Math.floor(Math.random() * (max - min + 1))
}

export function pickObject(obj: KeyValuePair, pickedKeys: string[]): KeyValuePair {
	const newObj: KeyValuePair = {}
	for (const key of pickedKeys) {
		newObj[key] = obj[key]
	}
	return newObj
}
