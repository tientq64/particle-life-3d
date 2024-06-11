export type IconProps = {
	name: string
}

export function Icon({ name }: IconProps) {
	return <span className="material-icons-round">{name}</span>
}
