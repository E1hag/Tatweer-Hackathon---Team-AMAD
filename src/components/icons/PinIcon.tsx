import { StyleSheet, View } from 'react-native';

import { colors, sizes } from '@/constants/theme';
import type { IconProps } from '@/components/icons/IconTypes';

export function PinIcon({ size = 18, color = colors.textMuted }: IconProps) {
  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <View style={[styles.circle, { width: size * 0.68, height: size * 0.68, borderRadius: size, borderColor: color }]}>
        <View style={[styles.dot, { width: size * 0.18, height: size * 0.18, borderRadius: size, backgroundColor: color }]} />
      </View>
      <View style={[styles.tip, { width: size * 0.34, height: size * 0.34, borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'flex-start' },
  circle: { alignItems: 'center', justifyContent: 'center', borderWidth: sizes.borderWidth },
  dot: {},
  tip: { marginTop: -sizes.iconStroke, borderRightWidth: sizes.borderWidth, borderBottomWidth: sizes.borderWidth, transform: [{ rotate: '45deg' }] },
});
