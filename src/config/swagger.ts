import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../../docs/swagger.json';
import type { Express } from 'express';

export function RegisterSwagger(app: Express) {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
