import { StyleSheet, View } from 'react-native';

import { colors, radius, sizes } from '@/constants/theme';
import type { IconProps } from '@/components/icons/IconTypes';

export function PlusIcon({ size = 18, color = colors.textMuted }: IconProps) {
  const bar = Math.max(sizes.iconStroke, size / 8);
  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <View style={[styles.bar, { width: size, height: bar, backgroundColor: color }]} />
      <View style={[styles.bar, { width: bar, height: size, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  bar: { position: 'absolute', borderRadius: radius.full },
});
