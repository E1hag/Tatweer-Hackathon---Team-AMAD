import { StyleSheet, View } from 'react-native';

import { colors, sizes } from '@/constants/theme';
import type { IconProps } from '@/components/icons/IconTypes';

export function HeartIcon({ size = 18, color = colors.textMuted, filled = false }: IconProps) {
  const fill = filled ? color : 'transparent';
  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <View style={[styles.lobe, styles.left, { width: size * 0.48, height: size * 0.48, borderRadius: size, borderColor: color, backgroundColor: fill }]} />
      <View style={[styles.lobe, styles.right, { width: size * 0.48, height: size * 0.48, borderRadius: size, borderColor: color, backgroundColor: fill }]} />
      <View style={[styles.base, { width: size * 0.5, height: size * 0.5, borderColor: color, backgroundColor: fill }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  lobe: { position: 'absolute', top: '18%', borderWidth: sizes.borderWidth },
  left: { left: '18%' },
  right: { right: '18%' },
  base: { position: 'absolute', top: '38%', borderRightWidth: sizes.borderWidth, borderBottomWidth: sizes.borderWidth, transform: [{ rotate: '45deg' }] },
});
