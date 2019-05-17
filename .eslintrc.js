module.exports = {
    parser:  '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    env: {
        es6: true,
        node: true
    },
    extends:  [
        "plugin:@typescript-eslint/recommended",
        "prettier",
        "prettier/@typescript-eslint"
    ],
    parserOptions:  {
        ecmaVersion:  2018,
        sourceType:  'module',
    },
    rules: {
        quotes: ["error", "single"],
        "@typescript-eslint/explicit-function-return-type": ["warn", {
            allowExpressions: true
        }],
        "semi": "off",
        "@typescript-eslint/semi": ["error"],
        "@typescript-eslint/no-parameter-properties": ["off"]
    }
};