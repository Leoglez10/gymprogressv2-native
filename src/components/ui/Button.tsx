import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
    md: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 16 },
    lg: { paddingVertical: 16, paddingHorizontal: 32, fontSize: 18 },
  };

  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: isDisabled ? 0.5 : 1,
      paddingVertical: sizeStyles[size].paddingVertical,
      paddingHorizontal: sizeStyles[size].paddingHorizontal,
      ...(fullWidth && { width: '100%' }),
    };

    switch (variant) {
      case 'secondary':
        return { ...base, backgroundColor: '#1a1a1a' };
      case 'outline':
        return { ...base, backgroundColor: 'transparent', borderWidth: 2, borderColor: '#FFEF0A' };
      case 'ghost':
        return { ...base, backgroundColor: 'transparent' };
      default:
        return base;
    }
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: '600',
      fontSize: sizeStyles[size].fontSize,
    };

    switch (variant) {
      case 'primary':
        return { ...base, color: '#1a1a1a' };
      case 'secondary':
        return { ...base, color: '#ffffff' };
      case 'outline':
        return { ...base, color: '#FFEF0A' };
      case 'ghost':
        return { ...base, color: '#ffffff' };
      default:
        return base;
    }
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#1a1a1a' : '#ffffff'} />
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </>
  );

  // Primary uses gradient
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[{ borderRadius: 16, overflow: 'hidden' }, fullWidth && { width: '100%' }, style]}
        {...props}
      >
        <LinearGradient
          colors={['#FFEF0A', '#FFD700']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[getButtonStyle(), { width: '100%' }]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[getButtonStyle(), style]}
      {...props}
    >
      {content}
    </TouchableOpacity>
  );
};
