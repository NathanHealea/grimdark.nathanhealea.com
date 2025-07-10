import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off', // Disable no-unused-vars rule
      '@typescript-eslint/no-unused-expressions': 'off', // Disable no-unused-expressions rule
      '@typescript-eslint/no-explicit-any': 'off', // Disable no-explicit-any rule
      '@typescript-eslint/no-empty-object-type': 'off', // Disable no-empty-object-type rule
    },
    ignorePatterns: ['./supabase/*', './.next', './node_modules', './dist'],
  }),
]
export default eslintConfig
