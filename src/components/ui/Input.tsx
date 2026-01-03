import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputStyles: StyleProp<TextStyle>[] = [styles.input];
  if (leftIcon) inputStyles.push({ paddingLeft: 0 });
  if (rightIcon) inputStyles.push({ paddingRight: 0 });
  if (style) inputStyles.push(style as TextStyle);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <RNTextInput
          style={inputStyles}
          placeholderTextColor="#666"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

interface PasswordInputProps extends Omit<InputProps, 'secureTextEntry' | 'rightIcon'> {}

export const PasswordInput: React.FC<PasswordInputProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      {...props}
      secureTextEntry={!showPassword}
      rightIcon={
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.toggleText}>{showPassword ? 'Ocultar' : 'Ver'}</Text>
        </TouchableOpacity>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: '#FFEF0A',
  },
  inputContainerError: {
    borderColor: '#ef4444',
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 14,
  },
  iconLeft: {
    marginRight: 12,
  },
  iconRight: {
    marginLeft: 12,
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  toggleText: {
    color: '#FFEF0A',
    fontSize: 14,
    fontWeight: '500',
  },
});
