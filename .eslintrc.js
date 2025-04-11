module.exports = {
  root: true,
  ignorePatterns: ["**/node_modules/", "**/build/"],
  parser: "@typescript-eslint/parser",
  plugins: {
    'custom-rules': require(path.resolve(__dirname, 'cloudpulse-pr-eslint-rules')),
  },
  rules: {
    'custom-rules/no-useless-template': 'warn',
    'custom-rules/no-non-null-assertion': 'warn',
  },
};
