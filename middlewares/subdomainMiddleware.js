const { Clinica } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const host = req.headers.host;
    const subdomain = host.split('.')[0];

    const clinica = await Clinica.findOne({
      where: { subdominio: subdomain }
    });

    if (!clinica)
      return res.status(404).json({ error: 'Clínica não encontrada' });

    req.clinica_id = clinica.id;

    next();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao identificar clínica' });
  }
};