import {appTools, defineConfig} from '@modern-js/app-tools';
import {bffPlugin} from '@modern-js/plugin-bff';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  server: {
    ssr: true,
  },
  plugins: [appTools(), bffPlugin()],
  tools: {
    postcss: {
      postcssOptions: {
        plugins: [
          require('@tailwindcss/postcss')
        ]
      }
    }
  }
});
