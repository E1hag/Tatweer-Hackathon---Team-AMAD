import { StyleSheet, View } from 'react-native';

import { colors, radius, sizes } from '@/constants/theme';
import type { IconProps } from '@/components/icons/IconTypes';

export function HomeIcon({ size = 18, color = colors.textMuted }: IconProps) {
  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <View style={[styles.roof, { width: size * 0.6, height: size * 0.6, borderColor: color }]} />
      <View style={[styles.body, { width: size * 0.68, height: size * 0.48, borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'flex-end' },
  roof: { position: 'absolute', top: '6%', borderLeftWidth: sizes.borderWidth, borderTopWidth: sizes.borderWidth, transform: [{ rotate: '45deg' }] },
  body: { borderLeftWidth: sizes.borderWidth, borderRightWidth: sizes.borderWidth, borderBottomWidth: sizes.borderWidth, borderBottomLeftRadius: radius.sm, borderBottomRightRadius: radius.sm },
});
