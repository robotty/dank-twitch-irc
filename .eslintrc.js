module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  env: {
    es6: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    project: "tsconfig.json",
  },
  rules: {
    "@typescript-eslint/explicit-function-return-type": [
      "warn",
      {
        allowExpressions: true,
      },
    ],
    "@typescript-eslint/no-parameter-properties": ["off"],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/prefer-interface": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/triple-slash-reference": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-function": "off",
    // this one doesn't allow usage of `object` which is stupid
    "@typescript-eslint/ban-types": "off",
    // "no-warning-comments": "warn"
  },
};
