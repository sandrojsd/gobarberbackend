import 'dotenv/config';

import express from 'express';
import path from 'path';
import cors from 'cors';
import * as Sentry from '@sentry/node';
import Youch from 'youch';
import 'express-async-errors';
import sentryConfig from './config/sentry';
import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();

    // inicializando o responsável por visualizar os erros do projeto
    Sentry.init(sentryConfig);

    this.midedlewares();
    this.routes();
    this.exceptionHandler();
  }

  midedlewares() {
    // o midedlewar do sentry tem que está acima do todos dos midedle do projeto
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    // o midedlewar do sentry tem que está depois de todas as rotas
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (error, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(error, req).toJSON();

        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'Internal Server Error' });
    });
  }
}

export default new App().server;
