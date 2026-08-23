import compression from 'compression';
import cors from 'cors';
import express, { type Express } from 'express';
import { xss } from 'express-xss-sanitizer';
import helmet from 'helmet';
import { notFoundHandler } from './common/middleware';
import { RegisterSwagger } from './config/swagger';
import passport from 'passport';
import { jwtStrategy } from './modules/auth/strategies/JwtStrategy';
import { requestContextMiddleware } from './common/middleware/requestContext';
import { httpLogger } from './common/middleware/httpLogger';
import { errorHandler } from './common/errors';
import { RegisterRoutes } from './generated-routes';

const app: Express = express();

app.use(requestContextMiddleware);
app.use(httpLogger);

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(xss());

app.use(compression());

app.use(cors());

passport.use(jwtStrategy);

RegisterRoutes(app);
RegisterSwagger(app);
app.use('*fallback', notFoundHandler);
app.use(errorHandler);

export default app;
