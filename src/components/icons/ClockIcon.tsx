import { StyleSheet, View } from 'react-native';

import { colors, radius, sizes } from '@/constants/theme';
import type { IconProps } from '@/components/icons/IconTypes';

export function ClockIcon({ size = 18, color = colors.textMuted }: IconProps) {
  const hand = Math.max(sizes.iconStroke, size / 10);
  return (
    <View style={[styles.root, { width: size, height: size, borderColor: color, borderRadius: size / 2 }]}>
      <View style={[styles.minute, { width: hand, height: size * 0.34, backgroundColor: color }]} />
      <View style={[styles.hour, { width: size * 0.28, height: hand, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { borderWidth: sizes.borderWidth, alignItems: 'center', justifyContent: 'center' },
  minute: { position: 'absolute', top: '24%', borderRadius: radius.full },
  hour: { position: 'absolute', left: '50%', top: '50%', borderRadius: radius.full },
});
