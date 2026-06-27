import { StyleSheet, View } from 'react-native';

import { colors, radius, sizes } from '@/constants/theme';
import type { IconProps } from '@/components/icons/IconTypes';

export function BriefcaseIcon({ size = 18, color = colors.textMuted }: IconProps) {
  return (
    <View style={[styles.root, { width: size, height: size * 0.72, borderColor: color }]}>
      <View style={[styles.handle, { width: size * 0.36, height: size * 0.22, borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginTop: '18%', borderWidth: sizes.borderWidth, borderRadius: radius.sm },
  handle: { alignSelf: 'center', marginTop: '-18%', borderTopWidth: sizes.borderWidth, borderLeftWidth: sizes.borderWidth, borderRightWidth: sizes.borderWidth, borderTopLeftRadius: radius.sm, borderTopRightRadius: radius.sm },
});
