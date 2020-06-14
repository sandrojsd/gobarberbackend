import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppontmentController from './app/controllers/AppontmenController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailabedController from './app/controllers/AvailabedController';

import authMiddlewares from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddlewares);

routes.put('/users', UserController.update);

routes.get('/providers', ProviderController.index);
routes.get('/providers/:providerId/availabed', AvailabedController.index);

routes.get('/appointments', AppontmentController.index);
routes.post('/appointments', AppontmentController.store);
routes.delete('/appointments/:id', AppontmentController.delete);

routes.get('/schedule', ScheduleController.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
