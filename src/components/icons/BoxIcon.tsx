import { StyleSheet, View } from 'react-native';

import { colors, radius, sizes } from '@/constants/theme';
import type { IconProps } from '@/components/icons/IconTypes';

export function BoxIcon({ size = 18, color = colors.textMuted }: IconProps) {
  const stroke = Math.max(sizes.borderWidth, size * 0.07);

  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <View
        style={[
          styles.tag,
          {
            width: size * 0.82,
            height: size * 0.62,
            borderColor: color,
            borderWidth: stroke,
            borderRadius: size * 0.16,
          },
        ]}
      >
        <View
          style={[
            styles.hole,
            {
              width: size * 0.16,
              height: size * 0.16,
              borderColor: color,
              borderRadius: size,
              borderWidth: stroke,
            },
          ]}
        />
        <View style={[styles.line, { width: size * 0.32, height: stroke, backgroundColor: color }]} />
        <View style={[styles.shortLine, { width: size * 0.22, height: stroke, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    justifyContent: 'center',
    paddingLeft: '30%',
    transform: [{ rotate: '-8deg' }],
  },
  hole: {
    position: 'absolute',
    left: '10%',
    top: '34%',
  },
  line: {
    borderRadius: radius.full,
  },
  shortLine: {
    marginTop: '12%',
    borderRadius: radius.full,
  },
});
