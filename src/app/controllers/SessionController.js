import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import File from '../models/File';
import auth from '../../config/auth';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({ error: 'Este usuário não existe' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'A senha não confere' });
    }

    const { id, name, avatar, provider } = user;

    // retornando o toker do usuário usando MD5 oline
    // gerei o token no md5 online (gobaberrocketseatnode2)
    return res.json({
      user: {
        id,
        name,
        email,
        avatar,
        provider,
      },
      token: jwt.sign({ id }, auth.secret, {
        expiresIn: auth.expiresIn,
      }),
    });
  }
}

export default new SessionController();
