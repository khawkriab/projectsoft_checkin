// import js from '@eslint/js';
// import tseslint from 'typescript-eslint';
// import pluginReact from 'eslint-plugin-react';
// import react from 'eslint-plugin-react';
// import reactHooks from 'eslint-plugin-react-hooks';
// import prettier from 'eslint-plugin-prettier';
// import globals from 'globals';

// export default [
//   // Base JS rules
//   js.configs.recommended,

//   // TypeScript recommended rules
//   ...tseslint.configs.recommended,
//   pluginReact.configs.flat.recommended,

//   {
//     files: ['**/*.{ts,tsx,js,jsx}'],

//     languageOptions: {
//       globals: globals.browser,
//       parser: tseslint.parser,
//       parserOptions: {
//         ecmaVersion: 'latest',
//         sourceType: 'module',
//         ecmaFeatures: {
//           jsx: true,
//         },
//       },
//     },

//     // env: {
//     //   browser: true,
//     //   node: true,
//     //   es2020: true,
//     // },

//     plugins: {
//       js,
//       react,
//       'react-hooks': reactHooks,
//       prettier,
//     },

//     settings: {
//       react: {
//         version: 'detect',
//       },
//     },

//     rules: {
//       /* ---------- TypeScript ---------- */
//       'no-unused-vars': 'warn',
//       '@typescript-eslint/no-unused-vars': [
//         'warn',
//         {
//           varsIgnorePattern: '^_',
//           argsIgnorePattern: '^_',
//         },
//       ],
//       '@typescript-eslint/no-explicit-any': 'off',
//       '@typescript-eslint/no-empty-interface': 'warn',

//       /* ---------- React ---------- */
//       'react/prop-types': 'warn',
//       'react/react-in-jsx-scope': 'off',
//       'react/jsx-uses-react': 'warn',

//       /* ---------- React Hooks ---------- */
//       'react-hooks/rules-of-hooks': 'error',
//       'react-hooks/exhaustive-deps': 'warn',

//       /* ---------- Prettier ---------- */
//       'prettier/prettier': 'warn',
//     },
//   },
// ];

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      'react/react-in-jsx-scope': 'off', // React 17+ transform
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]);
