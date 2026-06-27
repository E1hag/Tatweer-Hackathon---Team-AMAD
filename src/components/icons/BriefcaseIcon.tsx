import { StyleSheet, View } from 'react-native';

import { colors, sizes } from '@/constants/theme';
import type { IconProps } from '@/components/icons/IconTypes';

export function BriefcaseIcon({ size = 18, color = colors.textMuted }: IconProps) {
  const stroke = Math.max(sizes.borderWidth, size * 0.065);

  return (
    <View
      style={[
        styles.root,
        {
          width: size,
          height: size * 0.72,
          borderColor: color,
          borderWidth: stroke,
          borderRadius: size * 0.14,
        },
      ]}
    >
      <View
        style={[
          styles.handle,
          {
            width: size * 0.38,
            height: size * 0.22,
            borderColor: color,
            borderWidth: stroke,
            borderBottomWidth: 0,
            borderTopLeftRadius: size * 0.1,
            borderTopRightRadius: size * 0.1,
          },
        ]}
      />
      <View style={[styles.seam, { height: stroke, backgroundColor: color }]} />
      <View
        style={[
          styles.latch,
          {
            width: size * 0.18,
            height: size * 0.14,
            borderColor: color,
            borderWidth: stroke,
            borderRadius: size * 0.05,
            backgroundColor: colors.surface,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: '18%',
  },
  handle: {
    position: 'absolute',
    top: '-24%',
    alignSelf: 'center',
  },
  seam: {
    position: 'absolute',
    top: '38%',
    left: 0,
    right: 0,
    opacity: 0.85,
  },
  latch: {
    position: 'absolute',
    top: '29%',
    alignSelf: 'center',
  },
});
