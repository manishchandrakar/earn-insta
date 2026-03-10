import { IDropdownItems } from '@/types/common'
import { ItemStatusEnum } from '@/types/enum'
import { wp, hp } from '@/utils/resposive'
import { AppColors } from '@/constants/Colors'
import { Dimensions } from 'react-native'

const { width: screenWidth } = Dimensions.get('window')
const baseWidth = 375 // iPhone 6 baseline (industry standard)

export const responsiveFontSize = (size: number): number => {
	// Use width-based scaling for consistency
	const scale = screenWidth / baseWidth
	const newSize = size * 8 * scale // 8px base multiplier

	// Prevent extreme scaling - keep fonts readable
	const minSize = size * 6 // Minimum 6px per unit
	const maxSize = size * 12 // Maximum 12px per unit

	return Math.round(Math.max(minSize, Math.min(newSize, maxSize)))
}

// Legacy function for backward compatibility
export const responsiveFontSizeLegacy = (percent: number) => {
	return Math.round((wp(percent) + hp(percent)) / 2)
}

export const isObjectEmpty = (obj: unknown): boolean => {
	return !obj || (typeof obj === 'object' && Object.keys(obj || {}).length === 0)
}

export const isArrayEmpty = (arr: unknown): boolean => {
	return !arr || (Array.isArray(arr) && arr.length === 0)
}

export const isValidKey = (key: string, obj: object): key is keyof typeof obj => key in obj

// Type guard to check if a value is a number
export const isNumber = (value: unknown): value is number => {
	return typeof value === 'number' && isFinite(value) && !isNaN(value)
}

// Helper type guard to check if value is a non-null object
export const isObject = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null
}

export const formatNumberToRupees = (amount: string | number): string => {
	const num = Number(amount)
	if (isNaN(num)) return '₹0'

	const formattedNum = num.toLocaleString('en-IN', {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2
	})

	return `₹${formattedNum}`
}

export const roundToTwoDecimal = (num: number): number => {
	return Math.round((num + Number.EPSILON) * 100) / 100
}

export const sliceText = (text: string, length: number) => {
	if (text.length > length) {
		return { text: `${text.slice(0, length)}...`, isReadMore: true }
	}

	return { text, isReadMore: false }
}

export const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time))

export const filterEmptyStrings = (array: string[]): string[] => {
	return array.filter(item => item !== '')
}



// remove empty spaces from string
export const removeSpaces = (str: string): string => str.replace(/\s/g, '')

// Concat strings and remove extra spaces
export const concatStrings = (strings: string[], separator = ' '): string => {
	return strings
		.filter(Boolean)
		.map(str => str.trim())
		.join(separator)
		.trim()
}


// Filter empty, null, undefined keys from object (with deep filtering support)
// eslint-disable-next-line @typescript-eslint/no-explicit-any


export const formatReviewCount = (count: number): string => {
	if (count >= 1000000) {
		return `${(count / 1000000).toFixed(1)}m`
	} else if (count >= 1000) {
		return `${(count / 1000).toFixed(1)}k`
	}
	return `${count}`
}

// Get status filter options
export const getStatusFilterOptions = (status: string): IDropdownItems[] => {
	const filterOptions = Object.values(ItemStatusEnum).flatMap(status => ({ label: status, value: status }))
	return [{ label: 'All', value: '' }, ...filterOptions]
}

export const get6DigitPinCodeOfAddress = (address: string) => {
	const match = address.match(/\d{6}/)
	return match ? match[0] : null
}

export const getHealthScoreColor = (score: number): string => {
	if (score >= 70) return AppColors.primary
	if (score >= 50) return AppColors.warning
	return AppColors.error
}