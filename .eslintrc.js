module.exports = {
    parser: '@typescript-eslint/parser',
    env: {
        es6: true,
        node: true
    },
    extends: [
        'plugin:@typescript-eslint/recommended',
    ],
    plugins: ['@typescript-eslint'],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    rules: {
        quotes: ['error', 'single'],
        '@typescript-eslint/explicit-function-return-type': ['warn', {
            allowExpressions: true
        }],
        'semi': 'off',
        '@typescript-eslint/semi': ['error'],
        '@typescript-eslint/no-parameter-properties': ['off'],
        'eol-last': ['error'],
        "@typescript-eslint/indent": ['warn', 4, {
            SwitchCase: 1,
            FunctionDeclaration: {
                parameters: "first"
            },
            FunctionExpression: {
                parameters: "first"
            },
            ArrayExpression: "first",
            ObjectExpression: "first",
            ImportDeclaration: "first",
        }],
        "@typescript-eslint/no-explicit-any": "off"
    }
};
