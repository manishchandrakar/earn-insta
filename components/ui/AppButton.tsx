import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  ViewStyle, TextStyle,
} from 'react-native';
import { wp, hp, responsiveFontSize } from '@/utils/resposive';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AppButton = ({
  label, onPress, loading = false, disabled = false,
  variant = 'primary', style, textStyle,
}: AppButtonProps) => (
  <TouchableOpacity
    style={[styles.base, styles[variant], (disabled || loading) && styles.disabled, style]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.8}
  >
    {loading
      ? <ActivityIndicator color={variant === 'primary' ? '#fff' : '#E91E8C'} />
      : <Text style={[styles.label, styles[`${variant}Label` as keyof typeof styles] as TextStyle, textStyle]}>{label}</Text>
    }
  </TouchableOpacity>
);

export default AppButton;

const styles = StyleSheet.create({
  base: {
    borderRadius: wp(3),
    paddingVertical: hp(1.75),
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: '#E91E8C' },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#444' },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  label: { fontSize: responsiveFontSize(15), fontWeight: '600' },
  primaryLabel: { color: '#fff' },
  outlineLabel: { color: '#fff' },
  ghostLabel: { color: '#E91E8C' },
});
