import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#DC2626', // Deep red
    primaryContainer: '#FECACA',
    secondary: '#B91C1C', // Dark red
    secondaryContainer: '#FEE2E2',
    tertiary: '#991B1B',
    surface: '#FFFFFF',
    surfaceVariant: '#F9FAFB',
    background: '#FFFFFF',
    error: '#EF4444',
    errorContainer: '#FECACA',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#111827',
    onSurfaceVariant: '#6B7280',
    outline: '#D1D5DB',
    inverseSurface: '#1F2937',
    inverseOnSurface: '#F9FAFB',
    inversePrimary: '#FCA5A5',
  },
};

export const colors = {
  primary: '#DC2626',
  primaryDark: '#B91C1C',
  primaryLight: '#FECACA',
  secondary: '#991B1B',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#D1D5DB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
};
