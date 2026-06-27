import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/constants/theme';
import type { IconProps } from '@/components/icons/IconTypes';

export function PersonIcon({ size = 18, color = colors.textMuted }: IconProps) {
  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <View style={{ width: size * 0.36, height: size * 0.36, borderRadius: size, backgroundColor: color }} />
      <View style={{ width: size * 0.72, height: size * 0.34, borderRadius: radius.full, backgroundColor: color }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'space-between' },
});
