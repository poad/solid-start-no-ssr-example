// @ts-check

// @ts-ignore
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import stylisticJsx from '@stylistic/eslint-plugin-jsx';
import tseslint from 'typescript-eslint';
// @ts-ignore
import eslintImport from "eslint-plugin-import";

import solid from 'eslint-plugin-solid';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    ignores: [
      '**/*.d.ts',
      '*.{js,jsx}',
      'src/tsconfig.json',
      'src/stories',
      '**/*.css',
      'node_modules/**/*',
      './.next/*',
      'out',
      '.storybook',
      'dist',
      '.vinxi',
      '.output',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ...eslintImport.flatConfigs.recommended,
    ...eslintImport.flatConfigs.typescript,
    plugins: {
      '@stylistic': stylistic,
      '@stylistic/ts': stylisticTs,
      '@stylistic/jsx': stylisticJsx,
      solid,
    },
    settings: {
      'import/internal-regex': '^~/',
      'import/resolver': {
        node: {
          extensions: ['.ts', '.tsx'],
        },
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      '@stylistic/semi': 'error',
      '@stylistic/ts/indent': ['error', 2],
      '@stylistic/jsx/jsx-indent': ['error', 2],
      "comma-dangle": ["error", "always-multiline"],
      semi: ["error", "always"],
    },
  },
);
