/**
 * iOS Native Design System
 * Mantener estos estilos en toda la app para consistencia con iOS
 */

import { TextStyle, ViewStyle } from 'react-native';

// ==================== COLORES ====================
export const IOSColors = {
  // Colores de la app
  primary: '#FFEF0A',
  background: '#0f0f0f',
  surface: '#1a1a1a',
  surfaceLight: '#2a2a2a',

  // Colores de sistema iOS
  label: '#FFFFFF',
  secondaryLabel: '#8E8E93',
  tertiaryLabel: '#48484A',
  placeholderText: '#52525b',

  separator: '#38383A',
  opaqueSeparator: '#38383A',

  // Colores semánticos iOS
  systemRed: '#FF3B30',
  systemGreen: '#34C759',
  systemBlue: '#007AFF',
  systemOrange: '#FF9500',
  systemYellow: '#FFCC00',
  systemPink: '#FF2D55',
  systemPurple: '#AF52DE',
  systemTeal: '#5AC8FA',
  systemIndigo: '#5856D6',

  // Fondos iOS
  systemBackground: '#000000',
  secondarySystemBackground: '#1C1C1E',
  tertiarySystemBackground: '#2C2C2E',

  // Fondos agrupados iOS
  systemGroupedBackground: '#000000',
  secondarySystemGroupedBackground: '#1C1C1E',
  tertiarySystemGroupedBackground: '#2C2C2E',
} as const;

// ==================== SOMBRAS iOS ====================
export const IOSShadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  // Sombras de color (para botones primarios)
  primaryGlow: {
    shadowColor: '#FFEF0A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  successGlow: {
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
} as const;

// ==================== BORDES iOS ====================
export const IOSBorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 9999,
} as const;

// ==================== ESPACIADO iOS ====================
export const IOSSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// ==================== TIPOGRAFÍA iOS ====================
export const IOSTypography = {
  // Large Titles (iOS Navigation)
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 41,
  },

  // Titles
  title1: {
    fontSize: 28,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 34,
  },
  title2: {
    fontSize: 22,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 28,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 25,
  },

  // Headlines
  headline: {
    fontSize: 17,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 22,
  },

  // Body
  body: {
    fontSize: 17,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 22,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 21,
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 18,
  },

  // Captions
  caption1: {
    fontSize: 12,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 13,
  },
} as const;

// ==================== COMPONENTES iOS ====================
export const IOSComponents = {
  // Botón primario iOS
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: IOSBorderRadius.full,
    backgroundColor: IOSColors.primary,
    ...IOSShadows.primaryGlow,
  } as ViewStyle,

  // Botón secundario iOS
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: IOSBorderRadius.full,
    backgroundColor: IOSColors.secondarySystemBackground,
    ...IOSShadows.small,
  } as ViewStyle,

  // Card iOS
  card: {
    backgroundColor: IOSColors.secondarySystemBackground + 'CC', // 80% opacity
    borderRadius: IOSBorderRadius['3xl'],
    padding: IOSSpacing.lg,
    ...IOSShadows.medium,
  } as ViewStyle,

  // Input iOS
  input: {
    backgroundColor: IOSColors.tertiarySystemBackground,
    borderRadius: IOSBorderRadius.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    color: IOSColors.label,
  } as TextStyle & ViewStyle,

  // Divider iOS
  divider: {
    height: 0.5,
    backgroundColor: IOSColors.separator,
  } as ViewStyle,
} as const;

// ==================== ANIMACIONES iOS ====================
export const IOSAnimations = {
  // Duraciones estándar de iOS
  duration: {
    instant: 0,
    fast: 200,
    normal: 300,
    slow: 400,
  },

  // Easing curves de iOS
  easing: {
    // Equivalent to iOS ease-in-out
    standard: 'ease-in-out',
    // Equivalent to iOS spring animation
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// ==================== UTILIDADES ====================

/**
 * Combina múltiples sombras de iOS
 */
export const combineShadows = (...shadows: ViewStyle[]) => {
  return Object.assign({}, ...shadows);
};

/**
 * Crea un estilo de botón iOS personalizado
 */
export const createIOSButton = (
  backgroundColor: string,
  shadowColor?: string
): ViewStyle => ({
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: IOSBorderRadius.full,
  backgroundColor,
  ...(shadowColor ? {
    shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  } : IOSShadows.small),
});

/**
 * Crea un estilo de card iOS personalizado
 */
export const createIOSCard = (
  opacity: number = 0.8,
  borderRadius: keyof typeof IOSBorderRadius = '3xl'
): ViewStyle => ({
  backgroundColor: IOSColors.secondarySystemBackground + Math.round(opacity * 255).toString(16).padStart(2, '0'),
  borderRadius: IOSBorderRadius[borderRadius],
  padding: IOSSpacing.lg,
  ...IOSShadows.medium,
});

export default {
  Colors: IOSColors,
  Shadows: IOSShadows,
  BorderRadius: IOSBorderRadius,
  Spacing: IOSSpacing,
  Typography: IOSTypography,
  Components: IOSComponents,
  Animations: IOSAnimations,
};
