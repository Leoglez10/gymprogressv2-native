/// <reference types="nativewind/types" />

// Este archivo extiende los tipos de React Native para soportar className de NativeWind
// NativeWind transforma las clases de Tailwind a estilos de React Native

import { ViewProps, TextProps, ImageProps, TextInputProps, ScrollViewProps, TouchableOpacityProps, PressableProps } from 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
  interface PressableProps {
    className?: string;
  }
  interface FlatListProps<T> {
    className?: string;
  }
}

declare module 'react-native-safe-area-context' {
  interface NativeSafeAreaViewProps {
    className?: string;
  }
}
