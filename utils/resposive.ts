import { Dimensions, useWindowDimensions } from 'react-native'

// Get static screen dimensions for StyleSheet.create usage
const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

/**
 * Convert width percentage to device pixels (static)
 * @param percentage - Width percentage (0-100)
 * @returns Pixel value rounded to nearest integer
 */
export const wp = (percentage: number): number => Math.round((screenWidth * percentage) / 100)

/**
 * Convert height percentage to device pixels (static)
 * @param percentage - Height percentage (0-100)
 * @returns Pixel value rounded to nearest integer
 */
export const hp = (percentage: number): number => Math.round((screenHeight * percentage) / 100)

/**
 * React hook for dynamic responsive dimensions
 * Updates when device orientation changes or window resizes
 * @returns Object with responsive functions and current dimensions
 */
export const useResponsive = () => {
	const { width, height } = useWindowDimensions()

	return {
		wp: (percentage: number) => Math.round((width * percentage) / 100),
		hp: (percentage: number) => Math.round((height * percentage) / 100),
		width,
		height,
		isLandscape: width > height,
		isPortrait: height > width
	}
}

/**
 * Get current screen dimensions
 * @returns Screen width and height in pixels
 */
export const getScreenDimensions = () => ({
	width: screenWidth,
	height: screenHeight,
	isLandscape: screenWidth > screenHeight,
	isPortrait: screenHeight > screenWidth
})

/**
 * Legacy compatibility exports for gradual migration
 * @deprecated Use wp/hp directly instead
 */
export const widthPercentageToDP = wp
export const heightPercentageToDP = hp

/**
 * Responsive font size based on device width
 * Scales between minimum and maximum values
 * @param baseSize - Base font size
 * @param factor - Scaling factor (default: 1)
 * @returns Calculated font size
 */
export const responsiveFontSize = (baseSize: number, factor: number = 1): number => {
	const scale = screenWidth / 375 // iPhone 6 baseline
	const scaledSize = baseSize * scale * factor

	// Clamp between reasonable bounds
	const minSize = baseSize * 0.8
	const maxSize = baseSize * 1.2

	return Math.round(Math.max(minSize, Math.min(scaledSize, maxSize)))
}

/**
 * Check if device is tablet based on dimensions
 * @returns true if device is likely a tablet
 */
export const isTablet = (): boolean => {
	const aspectRatio = screenHeight / screenWidth
	const minDimension = Math.min(screenWidth, screenHeight)

	// Tablet heuristics: larger screen + different aspect ratio
	return minDimension >= 768 && aspectRatio < 1.6
}

/**
 * Get device size category
 * @returns Device size category
 */
export const getDeviceSize = (): 'small' | 'medium' | 'large' | 'tablet' => {
	if (isTablet()) return 'tablet'

	if (screenWidth <= 375) return 'small'
	if (screenWidth <= 414) return 'medium'
	return 'large'
}