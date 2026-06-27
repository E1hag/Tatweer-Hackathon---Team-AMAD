import { StyleSheet, View } from 'react-native';

import { colors, radius, sizes } from '@/constants/theme';
import type { IconProps } from '@/components/icons/IconTypes';

export function CalendarIcon({ size = 18, color = colors.textMuted }: IconProps) {
  return (
    <View style={[styles.root, { width: size, height: size, borderColor: color }]}>
      <View style={[styles.topBar, { backgroundColor: color }]} />
      <View style={[styles.notch, styles.left, { backgroundColor: color }]} />
      <View style={[styles.notch, styles.right, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { borderWidth: sizes.borderWidth, borderRadius: radius.sm, overflow: 'hidden' },
  topBar: { height: '28%' },
  notch: { position: 'absolute', top: 0, width: sizes.iconStroke, height: '36%' },
  left: { left: '28%' },
  right: { right: '28%' },
});
