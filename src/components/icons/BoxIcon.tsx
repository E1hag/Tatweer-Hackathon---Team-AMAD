import { StyleSheet, View } from 'react-native';

import { colors, radius, sizes } from '@/constants/theme';
import type { IconProps } from '@/components/icons/IconTypes';

export function BoxIcon({ size = 18, color = colors.textMuted }: IconProps) {
  return (
    <View style={[styles.root, { width: size, height: size, borderColor: color }]}>
      <View style={[styles.diagonal, styles.one, { width: size * 0.72, backgroundColor: color }]} />
      <View style={[styles.diagonal, styles.two, { width: size * 0.72, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { borderWidth: sizes.borderWidth, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  diagonal: { position: 'absolute', height: sizes.borderWidth, borderRadius: radius.full },
  one: { transform: [{ rotate: '35deg' }] },
  two: { transform: [{ rotate: '-35deg' }] },
});
