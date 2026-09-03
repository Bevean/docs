import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'dist-ssr', 'src/content/generated', 'public/content-assets'] },

  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
    }
  },

  {
    // Um bloco é um contrato (dado) que por acaso carrega um componente de
    // render. Fast refresh nunca vai valer para esses arquivos.
    files: ['src/content/blocks/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' }
  },

  {
    // zod é build-only. Um import de valor aqui coloca a biblioteca inteira no
    // bundle do navegador para validar dado que já foi validado no build.
    // scripts/check-bundle.ts confere o resultado, esta regra evita chegar lá.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/schema', '**/schema/*', '#schema', '#schema/*', 'zod'],
              allowTypeImports: true,
              message:
                'zod e os schemas são build-only: use `import type`, ou mova a lógica para scripts/.'
            }
          ]
        }
      ]
    }
  }
)
