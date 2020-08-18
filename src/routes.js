import { Router } from 'express';
import Brute from 'express-brute';
import BruteRedis from 'express-brute-redis';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailabedController from './app/controllers/AvailabedController';

import validadeUserStore from './app/validators/UserStores';
import validadeUserUpdate from './app/validators/UserUpdate';
import validadeAppointmentStore from './app/validators/AppointmentStore';
import validadeSessionCreate from './app/validators/SessionCreate';

import authMiddlewares from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

const bruteStore = new BruteRedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const bruteForce = new Brute(bruteStore);

routes.post('/users', validadeUserStore, UserController.store);
routes.post('/sessions', bruteForce.prevent, validadeSessionCreate, SessionController.store);

routes.use(authMiddlewares);

routes.put('/users', validadeUserUpdate, UserController.update);

routes.get('/providers', ProviderController.index);
routes.get('/providers/:providerId/availabed', AvailabedController.index);

routes.get('/appointments', AppointmentController.index);
routes.post('/appointments',validadeAppointmentStore, AppointmentController.store);
routes.delete('/appointments/:id', AppointmentController.delete);

routes.get('/schedule', ScheduleController.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
