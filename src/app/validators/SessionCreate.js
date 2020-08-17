import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      email: Yup.string()
        .required()
        .email(),
      password: Yup.string().required(),
    });
    
    await schema.validate(req.body, { abortEarly: false});

    return next();
  } catch (err) {
    return res.status(400).json({ error: 'Informe o login e a senha!', messages: err.inner });    
  }
}