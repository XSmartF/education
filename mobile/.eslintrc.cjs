module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import', 'unicorn'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      node: { extensions: ['.ts', '.tsx'] },
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    'unicorn/filename-case': [
      'error',
      {
        cases: { kebabCase: true, pascalCase: true },
        ignore: [
          '^index\\.',
          '^app\\.json$',
          '.*\\.test\\.',
          '.*\\.spec\\.',
          '.*\\.d\\.ts$',
        ],
      },
    ],
  },
  ignorePatterns: ['node_modules', 'dist', '.expo'],
};
