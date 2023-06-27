import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import tsconfigPaths from 'vite-tsconfig-paths';
import { getLastCommit } from './commitInfo';
const commitInfo = getLastCommit({});

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: '../../_dist'
  },
  assetsInclude: ['**/*.wav', '**/*.mp3'],
  define: {
    __COMMIT_INFO__: JSON.stringify(commitInfo),
    __BUILD_INFO__: JSON.stringify({
      buildTime: Date.now()
    })
  },
  plugins: [
    tsconfigPaths(),
    react(),
    glsl(),
    {
      name: 'configure-response-headers',
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          next();
        });
      }
    }
  ]
});
