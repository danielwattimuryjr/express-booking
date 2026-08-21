import compression from 'compression';
import cors from 'cors';
import express, { type Express } from 'express';
import { xss } from 'express-xss-sanitizer';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middleware';
import { RegisterRoutes } from './routes/routes';
import { RegisterSwagger } from './config/swagger';
import passport from 'passport';
import { jwtStrategy } from './config/passport';
import { requestContextMiddleware } from './middleware/requestContext';
import { httpLogger } from './middleware/httpLogger';

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
