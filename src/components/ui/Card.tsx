import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'gradient';
  gradientColors?: [string, string, ...string[]];
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  gradientColors = ['#1a1a1a', '#252525'],
  padding = 'md',
  style,
  ...props
}) => {
  const paddingValues = {
    none: 0,
    sm: 12,
    md: 16,
    lg: 24,
  };

  const baseStyle: ViewStyle = {
    borderRadius: 20,
    padding: paddingValues[padding],
    overflow: 'hidden',
  };

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[baseStyle, style]}
        {...props}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        baseStyle,
        variant === 'default' && styles.default,
        variant === 'elevated' && styles.elevated,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  default: {
    backgroundColor: '#1a1a1a',
  },
  elevated: {
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
