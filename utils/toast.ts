import Toast from 'react-native-toast-message'

/**
 * Toast Utility
 *
 * Wrapper around react-native-toast-message for consistent usage
 * throughout the application. Provides predefined types and styling.
 */

export interface IToastOptions {
	title?: string
	duration?: number
	position?: 'top' | 'bottom'
	onPress?: () => void
	onHide?: () => void
}

/**
 * Show success toast
 */
export const showSuccess = (message: string, options?: IToastOptions) => {
	Toast.show({
		type: 'success',
		text1: options?.title || 'Success',
		text2: message,
		position: options?.position || 'top',
		visibilityTime: options?.duration || 4000,
		onPress: options?.onPress,
		onHide: options?.onHide
	})
}

/**
 * Show error toast
 */
export const showError = (message: string, options?: IToastOptions) => {
	Toast.show({
		type: 'error',
		text1: options?.title || 'Error',
		text2: message,
		position: options?.position || 'top',
		visibilityTime: options?.duration || 5000,
		onPress: options?.onPress,
		onHide: options?.onHide
	})
}

/**
 * Show warning toast
 */
export const showWarning = (message: string, options?: IToastOptions) => {
	Toast.show({
		type: 'error', // react-native-toast-message doesn't have warning, using info
		text1: options?.title || 'Warning',
		text2: message,
		position: options?.position || 'top',
		visibilityTime: options?.duration || 4000,
		onPress: options?.onPress,
		onHide: options?.onHide
	})
}

/**
 * Show info toast
 */
export const showInfo = (message: string, options?: IToastOptions) => {
	Toast.show({
		type: 'info',
		text1: options?.title || 'Info',
		text2: message,
		position: options?.position || 'top',
		visibilityTime: options?.duration || 4000,
		onPress: options?.onPress,
		onHide: options?.onHide
	})
}

/**
 * Show default toast
 */
export const showToast = (message: string, options?: IToastOptions) => {
	Toast.show({
		type: 'success', // Default to success for better visibility
		text1: options?.title || 'Notification',
		text2: message,
		position: options?.position || 'top',
		visibilityTime: options?.duration || 4000,
		onPress: options?.onPress,
		onHide: options?.onHide
	})
}

/**
 * Hide all toasts
 */
export const hideAllToasts = () => {
	Toast.hide()
}

/**
 * Toast object for easier usage (similar to our previous implementation)
 */
export const toast = {
	success: showSuccess,
	error: showError,
	warning: showWarning,
	info: showInfo,
	show: showToast,
	hideAll: hideAllToasts
}

export default toast