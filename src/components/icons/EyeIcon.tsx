import { StyleSheet, View } from 'react-native';

import { colors, radius, sizes } from '@/constants/theme';
import type { IconProps } from '@/components/icons/IconTypes';

export function EyeIcon({ size = 18, color = colors.textMuted }: IconProps) {
  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <View style={[styles.lid, { width: size * 0.82, height: size * 0.46, borderColor: color }]} />
      <View style={[styles.dot, { width: size * 0.18, height: size * 0.18, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  lid: {
    borderTopWidth: sizes.borderWidth,
    borderBottomWidth: sizes.borderWidth,
    borderRadius: radius.full,
  },
  dot: { position: 'absolute', borderRadius: radius.full },
});
