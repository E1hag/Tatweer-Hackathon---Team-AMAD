import { StyleSheet, View } from 'react-native';

import { colors, radius, sizes } from '@/constants/theme';
import type { IconProps } from '@/components/icons/IconTypes';

export function ClipboardIcon({ size = 18, color = colors.textMuted }: IconProps) {
  return (
    <View style={[styles.root, { width: size * 0.82, height: size, borderColor: color }]}>
      <View style={[styles.tab, { width: size * 0.42, height: size * 0.18, borderColor: color, backgroundColor: colors.surface }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { borderWidth: sizes.borderWidth, borderRadius: radius.sm, alignItems: 'center' },
  tab: { marginTop: -sizes.iconStroke, borderWidth: sizes.borderWidth, borderRadius: radius.sm },
});
