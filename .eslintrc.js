module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    project: './tsconfig.json',
    ecmaVersion: 2019,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'prettier/standard',
    'prettier/react',
    'prettier/@typescript-eslint'
  ],
  rules: {
    camelcase: 'warn',
    'no-console': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/camelcase': 'warn',
    'react/no-unescaped-entities': 'warn'
  }
}
