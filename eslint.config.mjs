import tseslint from 'typescript-eslint';
import jsPlugin from '@eslint/js';
import stylisticPlugin from '@stylistic/eslint-plugin';
import jestPlugin from 'eslint-plugin-jest';
import importPlugin from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';
import unicornPlugin from 'eslint-plugin-unicorn';
import nodePlugin from 'eslint-plugin-n';

import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: jsPlugin.configs.recommended,
});

/**
 * @type {import('eslint').Linter.FlatConfig[]}
 */
export default [
  {
    ignores: ['dist'],
  },
  {
    languageOptions: {
      sourceType: 'commonjs',
      parserOptions: {
        project: true,
        tsConfigRootDir: import.meta.dirname,
      },
    },
  },
  jsPlugin.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  jestPlugin.configs['flat/recommended'],
  ...compat.config(importPlugin.configs.recommended),
  ...compat.config(promisePlugin.configs.recommended),
  ...nodePlugin.configs['flat/mixed-esm-and-cjs'],
  unicornPlugin.configs['flat/recommended'],
  stylisticPlugin.configs.customize({
    semi: true,
    arrowParens: true,
    braceStyle: '1tbs',
    quoteProps: 'consistent',
  }),
  {
    rules: {
      'unicorn/prefer-module': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/switch-case-braces': 'off',
      'unicorn/no-await-expression-member': 'off',

      // Remove after import plugin supports flat config
      // [Feature Request] Support new ESLint flat config (https://github.com/import-js/eslint-plugin-import/issues/2556)
      'import/namespace': 'off',
      'import/no-unresolved': 'off',
    },
  },
  {
    files: ['*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
  },
];
