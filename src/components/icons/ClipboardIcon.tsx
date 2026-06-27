import { StyleSheet, View } from 'react-native';

import { colors, radius, sizes } from '@/constants/theme';
import type { IconProps } from '@/components/icons/IconTypes';

export function ClipboardIcon({ size = 18, color = colors.textMuted }: IconProps) {
  const stroke = Math.max(sizes.borderWidth, size * 0.065);

  return (
    <View
      style={[
        styles.root,
        { width: size * 0.84, height: size, borderColor: color, borderWidth: stroke },
      ]}
    >
      <View
        style={[
          styles.tab,
          {
            width: size * 0.44,
            height: size * 0.2,
            borderColor: color,
            borderWidth: stroke,
            backgroundColor: colors.surface,
          },
        ]}
      />
      <View style={[styles.line, { width: size * 0.44, height: stroke, backgroundColor: color }]} />
      <View style={[styles.line, { width: size * 0.32, height: stroke, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: '16%',
    paddingTop: '30%',
    borderRadius: radius.sm,
  },
  tab: {
    position: 'absolute',
    top: '-10%',
    borderRadius: radius.sm,
  },
  line: {
    borderRadius: radius.full,
  },
});
