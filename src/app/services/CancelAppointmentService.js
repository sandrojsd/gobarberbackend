import { isBefore, subHours } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

import Cache from '../../lib/Cache';

class CancelAppointmentService {
  async run({appointmentId, user_id}){
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });
    
    if (appointment.user_id !== user_id) {
      throw new Error('Você não tem permissão para cancelar este agendamento.');
    }
    // verifica se o cancelmente está sendo feito 2hs antes do agendado
    const dateWithSub = subHours(appointment.date, 2);
    
    if (isBefore(dateWithSub, new Date())) {
      throw new Error('Você só pode cancelar uma agendamento 2 horas antes do que foi agendado.');
    }
    
    appointment.canceled_at = new Date();
    appointment.save();
    
    await Queue.add(CancellationMail.key, {
      appointment,
    });

     //invalidar o cache
     await Cache.invalidatePrefix(`user:${user_id}:appointments`);

    return appointment;
  }  
}

export default new CancelAppointmentService();

