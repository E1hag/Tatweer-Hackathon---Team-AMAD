import { StyleSheet, View } from 'react-native';

import { colors, radius, sizes } from '@/constants/theme';
import type { IconProps } from '@/components/icons/IconTypes';

export function ArrowRightIcon({ size = 18, color = colors.textMuted }: IconProps) {
  const bar = Math.max(sizes.iconStroke, size / 9);
  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <View style={[styles.line, styles.top, { width: size * 0.48, height: bar, backgroundColor: color }]} />
      <View style={[styles.line, styles.bottom, { width: size * 0.48, height: bar, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  line: { position: 'absolute', right: '18%', borderRadius: radius.full },
  top: { transform: [{ rotate: '45deg' }], top: '35%' },
  bottom: { transform: [{ rotate: '-45deg' }], bottom: '35%' },
});
