module.exports = {
  parser: "@typescript-eslint/parser",
  env: {
    es6: true,
    node: true
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint"
  ],
  plugins: ["@typescript-eslint", "@typescript-eslint/tslint", "prettier"],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    project: "tsconfig.json"
  },
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/explicit-function-return-type": [
      "warn",
      {
        allowExpressions: true
      }
    ],
    "@typescript-eslint/no-parameter-properties": ["off"],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/prefer-interface": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/tslint/config": [
      "warn",
      {
        lintFile: "./tslint.json"
      }
    ],
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/triple-slash-reference": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
    // already done by tslint
    "@typescript-eslint/no-empty-function": "off"
    // "no-warning-comments": "warn"
  }
};
