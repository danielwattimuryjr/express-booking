import { defineConfig } from 'orval';

export default defineConfig({
    petstore: {
        output: {
            mode: 'tags-split',
            target: 'frontend/src/api/petstore.ts',
            schemas: 'frontend/src/api/model',
            client: 'react-query',
            mock: true,
        },
        input: {
            target: './src/docs/swagger.json',
        },
    },
});
