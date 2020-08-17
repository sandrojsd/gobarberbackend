import 'dotenv/config';

import express from 'express';
import path from 'path';
import cors from 'cors';
import * as Sentry from '@sentry/node';
import Youch from 'youch';
import 'express-async-errors';
import sentryConfig from './config/sentry';
import routes from './routes';
import io from 'socket.io';
import http from 'http';

import './database';

class App {
  constructor() {
    this.app = express();
    // pegando o protocolo http que está dentro do express
    this.server = http.Server(this.app);

    // inicializando o responsável por visualizar os erros do projeto
    Sentry.init(sentryConfig);

    this.socket();

    this.midedlewares();
    this.routes();
    this.exceptionHandler();

    this.connectedUsers = {};
  }

  socket() {
    this.io = io(this.server);

    //escutando os eventos dentro do io
    this.io.on('connection', socket => {
      const { user_id } = socket.handshake.query;
      this.connectedUsers[user_id] = socket.id;

      socket.on('disconnect', () => {
        delete this.connectedUsers[user_id];
      });
    });
  }

  midedlewares() {
    // o midedlewar do sentry tem que está acima do todos dos midedle do projeto
    this.app.use(Sentry.Handlers.requestHandler());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );

    this.app.use((req, res, next) => {
      req.io = this.io;
      req.connectedUsers = this.connectedUsers;

      next();
    });
  }

  routes() {
    this.app.use(routes);
    // o midedlewar do sentry tem que está depois de todas as rotas
    this.app.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.app.use(async (error, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(error, req).toJSON();

        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'Internal Server Error' });
    });
  }
}

export default new App().server;
