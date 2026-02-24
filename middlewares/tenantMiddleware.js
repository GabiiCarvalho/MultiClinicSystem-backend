const jwt = require('jsonwebtoken');
const { Clinica } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      return res.status(401).json({ error: 'Token não fornecido' });

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = decoded;

    // FORÇA clinica_id no request
    req.clinica_id = decoded.clinica_id;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};