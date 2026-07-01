import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // localStorage の初期化は useEffect 内で setState するのが Next.js の正しいパターン。
      // SSR 環境では window が存在しないため、マウント後に状態をセットする必要がある。
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);

export default eslintConfig;
