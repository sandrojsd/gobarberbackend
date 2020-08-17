import AvailabelService from '../services/AvailabelService';

class AvailabedController {
  async index(req, res) {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ eror: 'Informe uma data' });
    }

    // transforma o date em inteiro, tbm poderia usar o parseInt()
    const searchDate = Number(date);

    const avaiable = AvailabelService.run({
      provider_id:  req.params.provaiderId,
      searchDate,
    })

    return res.json(avaiable);
  }
}

export default new AvailabedController();
