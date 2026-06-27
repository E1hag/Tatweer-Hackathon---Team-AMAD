import { StyleSheet, View } from 'react-native';

import { colors, radius, sizes } from '@/constants/theme';
import type { IconProps } from '@/components/icons/IconTypes';

export function CheckIcon({ size = 18, color = colors.textMuted }: IconProps) {
  const bar = Math.max(sizes.iconStroke, size / 9);
  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <View style={[styles.short, { width: size * 0.38, height: bar, backgroundColor: color }]} />
      <View style={[styles.long, { width: size * 0.68, height: bar, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  short: { position: 'absolute', left: '18%', top: '52%', borderRadius: radius.full, transform: [{ rotate: '45deg' }] },
  long: { position: 'absolute', left: '36%', top: '45%', borderRadius: radius.full, transform: [{ rotate: '-45deg' }] },
});
