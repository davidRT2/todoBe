import path from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';

import logger from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { routes } from '#src/router.mjs';

global.__dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
// app.use(
//   cors({
//     origin: '*',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     preflightContinue: false,
//     optionsSuccessStatus: 204,
//   }),
// );

const allowedOrigins = ['https://todo-app-self-phi.vercel.app'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        // Allow requests with no origin (like mobile apps or curl)
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        // Allow the request if the origin is in the allowedOrigins array
        return callback(null, true);
      }

      // Block requests not in allowedOrigins
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Enable credentials only for allowed origins
  }),
);

app.use(cookieParser());
app.disable('x-powered-by');

routes(app);

app.use('/assets', express.static(`${__dirname}/public`));

export default app;
