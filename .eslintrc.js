module.exports = {
    root: true,
    env: {
        node: true,
        es2021: true,
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.json"]
    },
    plugins: ["@typescript-eslint"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "rules": {
        quotes: ["error", "double"],
        "@typescript-eslint/no-unused-vars": ["warn"],
        "no-console": [
            "warn",
            {
                allow: ["warn", "error"]
            }
        ]
    }
}