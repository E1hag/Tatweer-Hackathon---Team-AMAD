import { Platform } from 'react-native';

export const colors = {
  primary: '#B85C38',
  primaryDark: '#843F29',
  accent: '#E4A853',
  background: '#FBF5EC',
  surface: '#FFFFFF',
  surfaceMuted: '#F3E7DA',
  text: '#2F2925',
  textMuted: '#81736A',
  border: '#E8DDD0',
  success: '#3C8D65',
  warning: '#E4A853',
  error: '#C34646',
  request: '#B85C38',
  availability: '#E4A853',
  card: '#FFFFFF',
  muted: '#81736A',
  sand: '#F3E7DA',
  danger: '#C34646',
  urgencyBackground: '#FBE7C6',
  urgencyText: '#843F29',
  overlay: 'rgba(47, 41, 37, 0.24)',
  terracotta: '#A8512F',
  terracottaDark: '#8A3F22',
  terracottaSoft: '#C66B43',
  statusOpenBg: '#E6F0E6',
  statusOpenText: '#2E6B43',
  statusOfferedBg: '#FBEAD0',
  statusOfferedText: '#9A5B16',
  statusFulfilledBg: '#E2EDF5',
  statusFulfilledText: '#2C5C84',
  statusClosedBg: '#EEEAE1',
  statusClosedText: '#6C7973',
  urgencyTodayBg: '#FBE3E1',
  urgencyTodayText: '#B23A2E',
  urgencyWeekBg: '#FBEAD0',
  urgencyWeekText: '#9A5B16',
  urgencyFlexibleBg: '#EAE6DC',
  urgencyFlexibleText: '#6C7973',
  demand: '#B23A2E',
  offers: '#6B5BA8',
  heroGlass: 'rgba(255, 255, 255, 0.12)',
  heroTextMuted: 'rgba(255, 255, 255, 0.85)',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 18,
  full: 999,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  lineHeights: {
    sm: 18,
    md: 22,
    lg: 28,
    xl: 34,
  },
  weights: {
    regular: '400' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const sizes = {
  dot: 5,
  tabDot: 8,
  iconCircle: 56,
  iconLine: 20,
  iconLineThickness: 2,
  tabBarHeight: 60,
  borderWidth: 1,
  thickBorderWidth: 1.5,
  buttonMinHeight: 36,
  chipMinHeight: 34,
  shadowOffsetHeight: 1,
  shadowOpacity: 0.06,
  shadowRadius: 3,
  elevation: 1,
  animationDuration: 1000,
  pressedOpacity: 0.92,
  disabledOpacity: 0.5,
  mutedOpacity: 0.4,
  shortcutIcon: 28,
  tabIcon: 20,
  heroProfileButton: 44,
  metaDot: 3,
  iconStroke: 2,
};

export const fonts = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
};

export const theme = { colors, spacing, radius, typography, sizes, fonts };
