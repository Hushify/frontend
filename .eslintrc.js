module.exports = {
    root: true,
    extends: ['next/core-web-vitals', 'prettier'],
    plugins: ['unused-imports'],
    settings: {
        tailwindcss: {
            callees: ['cn', 'clsx', 'tw'],
        },
    },
    rules: {
        'react/jsx-key': 'error',
        'react/prop-types': 'off',
        'react/require-default-props': 'off',
        'react/jsx-props-no-spreading': 'off',
        semi: ['error', 'always'],
        'unused-imports/no-unused-imports': 'error',
        'jsx-a11y/label-has-associated-control': [
            2,
            {
                depth: 3,
            },
        ],
    },
    ignorePatterns: [
        '**/*.js',
        '**/*.json',
        'node_modules',
        'public',
        'styles',
        '.next',
        'coverage',
        'dist',
    ],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: './tsconfig.json',
    },
};
