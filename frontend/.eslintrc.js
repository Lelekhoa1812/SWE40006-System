module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'jsx-a11y'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
    'prettier',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
  ignorePatterns: ['node_modules/', '.next/', 'dist/'],
};
