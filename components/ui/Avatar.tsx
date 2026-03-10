import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { wp, responsiveFontSize } from '@/utils/resposive';

interface AvatarProps {
  size?: number;
  name?: string;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
}

const Avatar = ({
  size = wp(11),
  name,
  color = '#333',
  borderColor,
  borderWidth = 0,
}: AvatarProps) => {
  const initial = name?.trim()?.[0]?.toUpperCase();

  return (
    <View style={[
      styles.avatar,
      {
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color,
        borderColor: borderColor ?? 'transparent',
        borderWidth,
      },
    ]}>
      {initial ? (
        <Text style={[styles.initial, { fontSize: responsiveFontSize(size * 0.4) }]}>
          {initial}
        </Text>
      ) : (
        <Ionicons name="person" size={size * 0.55} color="#fff" />
      )}
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  avatar: { justifyContent: 'center', alignItems: 'center' },
  initial: { color: '#fff', fontWeight: 'bold' },
});
