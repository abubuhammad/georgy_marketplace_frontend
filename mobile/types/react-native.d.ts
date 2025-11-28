// Type declarations for React Native modules
/// <reference types="react" />

// Suppress global type library errors
declare module 'geojson' { const value: any; export = value; }
declare module 'hammerjs' { const value: any; export = value; }
declare module 'hoist-non-react-statics' { const value: any; export = value; }
declare module 'istanbul-lib-coverage' { const value: any; export = value; }
declare module 'istanbul-lib-report' { const value: any; export = value; }
declare module 'istanbul-reports' { const value: any; export = value; }
declare module 'json-schema' { const value: any; export = value; }
declare module 'json5' { const value: any; export = value; }
declare module 'prop-types' { const value: any; export = value; }
declare module 'react-native-vector-icons' { const value: any; export = value; }
declare module 'semver' { const value: any; export = value; }
declare module 'stack-utils' { const value: any; export = value; }
declare module 'use-sync-external-store' { const value: any; export = value; }
declare module 'yargs' { const value: any; export = value; }
declare module 'yargs-parser' { const value: any; export = value; }
declare module 'react-native' {
  import { ComponentType } from 'react';
  
  export interface ViewProps {
    style?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface TextProps {
    style?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface ImageProps {
    source?: any;
    style?: any;
    [key: string]: any;
  }
  
  export interface ScrollViewProps {
    style?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface StatusBarProps {
    barStyle?: 'default' | 'light-content' | 'dark-content';
    backgroundColor?: string;
    hidden?: boolean;
  }
  
  export const View: ComponentType<ViewProps>;
  export const Text: ComponentType<TextProps>;
  export const Image: ComponentType<ImageProps>;
  export const ScrollView: ComponentType<ScrollViewProps>;
  export const StatusBar: ComponentType<StatusBarProps>;
  
  export const StyleSheet: {
    create: (styles: any) => any;
    [key: string]: any;
  };
  
  export const Dimensions: {
    get: (dimension: 'window' | 'screen') => { width: number; height: number };
    [key: string]: any;
  };
}

declare module 'react-native-paper' {
  import { ComponentType } from 'react';
  
  export interface ButtonProps {
    mode?: 'text' | 'outlined' | 'contained';
    onPress?: () => void;
    children?: React.ReactNode;
    style?: any;
    [key: string]: any;
  }
  
  export interface CardProps {
    style?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface CardContentProps {
    style?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export interface IconButtonProps {
    icon: string;
    onPress?: () => void;
    size?: number;
    [key: string]: any;
  }
  
  export const Button: ComponentType<ButtonProps>;
  export const Card: ComponentType<CardProps> & {
    Content: ComponentType<CardContentProps>;
  };
  export const IconButton: ComponentType<IconButtonProps>;
}

declare module 'react-native-safe-area-context' {
  import { ComponentType } from 'react';
  
  export interface SafeAreaViewProps {
    style?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }
  
  export const SafeAreaView: ComponentType<SafeAreaViewProps>;
}

declare module '@react-navigation/native' {
  export function useNavigation(): any;
}

declare module '@react-navigation/native-stack' {
  export interface NativeStackNavigationProp<T, K> {
    navigate: (screen: keyof T, params?: any) => void;
    goBack: () => void;
    [key: string]: any;
  }
}

declare module 'react-native-vector-icons/MaterialIcons' {
  import { ComponentType } from 'react';
  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  const Icon: ComponentType<IconProps>;
  export default Icon;
}

declare module '@expo/vector-icons' {
  export const Ionicons: any;
  export const MaterialIcons: any;
  export const FontAwesome: any;
}
