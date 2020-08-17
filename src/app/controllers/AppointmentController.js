import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';

import CreateAppoitmentService from '../services/CreateAppointmentService';
import CancelAppointmentService from '../services/CancelAppointmentService';

import Cache from '../../lib/Cache';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const cacheKey = `user:${req.userId}:appointments:${page}`;
    const cached = await Cache.get(cacheKey);

    if(cached){
      return res.json(cached);
    }

    const appointements = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'url', 'path'],
            },
          ],
        },
      ],
    });

    await Cache.set(cacheKey, appointements);

    return res.json(appointements);
  }

  async store(req, res) {
    const { provider_id, date } = req.body;     
    
    const appointment = await CreateAppoitmentService.run({
      provider_id,
      user_id: req.userId,
      date,
    });
    
    const user = await User.findByPk(req.userId);

    const formattedDate = format(
      appointment.date,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );


    const notification = await Notification.create({
      content: `Novo agendamento criado por ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    const ownerSocket = req.connectedUsers[provider_id];

    if(ownerSocket) {
      req.io.to(ownerSocket).emit('notification', notification);
    }

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await CancelAppointmentService.run({
      appointmentId: req.params.id,
      user_id: req.userId,
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
