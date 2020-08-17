import { startOfHour, parseISO, isBefore } from 'date-fns';
import User from '../models/User';
import Appointment from '../models/Appointment';

import Cache from '../../lib/Cache';

class CreateAppointmentService {
  async run({provider_id, user_id, date}){
    // check is provider_id is a provider
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      throw new Error('Você só pode criar agendmaento com prestadores de serviços.');
    }

    /**
     * check past date
     */
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      throw new Error('Datas passadas não são permitadas.');
    }

    /**
     * check date availability
     */
    const checkAvaiability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvaiability) {
      throw new Error('Agendamento não permitido');
    }

    const appointment = await Appointment.create({
      user_id,
      provider_id,
      date,
    });    

    //invalidar o cache
    await Cache.invalidatePrefix(`user:${user_id}:appointments`);

    return appointment;
  }
}

export default new CreateAppointmentService();