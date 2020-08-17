import User from '../models/User';
import Files from '../models/File';

import Cache from '../../lib/Cache';

class ProviderController {
  async index(req, res) {

    const providersCached = await Cache.get('providers')

    if(providersCached){
      return res.json(providersCached);
    }

    const providers = await User.findAll({
      where: { provider: true },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: Files,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    await Cache.set('providers', providers);

    return res.json(providers);
  }
}

export default new ProviderController();
