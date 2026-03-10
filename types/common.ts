export interface IDropdownItems {
	label: string
	value: string
}

export interface IPaginationMeta {
	page: number
	limit: number
	total: number
	totalPages: number
}

export interface IApiResponse<T> {
	data: T
	message: string
	success: boolean
}

export interface ISelectOption {
	label: string
	value: string | number
	disabled?: boolean
}
