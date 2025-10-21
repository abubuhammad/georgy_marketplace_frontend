// Global type declarations for React Native
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

// Asset module declarations
declare module '*.png' { const value: any; export = value; }
declare module '*.jpg' { const value: any; export = value; }
declare module '*.jpeg' { const value: any; export = value; }
declare module '*.gif' { const value: any; export = value; }
declare module '*.svg' { const value: any; export = value; }

// Suppress common library type errors
declare module 'node' { const value: any; export = value; }

export {};
