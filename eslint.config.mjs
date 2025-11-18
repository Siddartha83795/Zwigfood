
import next from 'eslint-config-next';
import { defineConfig } from 'eslint-define-config';

const eslintConfig = defineConfig([
    {
        ...next,
        rules: {
            ...next.rules,
            'react/no-unescaped-entities': 'off',
            '@next/next/no-page-custom-font': 'off',
        }
    }
]);

export default eslintConfig;
