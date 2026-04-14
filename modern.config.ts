import {appTools, defineConfig} from '@modern-js/app-tools';
import tailwindcssPlugin from '@modern-js/plugin-tailwindcss';
import {bffPlugin} from '@modern-js/plugin-bff';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  server: {
    ssr: true,
  },
  plugins: [appTools(), bffPlugin()],
});
