const { Loja } = require('../models');

module.exports = async (req, res, next) => {
  try {
    if (!req.lojaId) {
      return res.status(403).json({ error: 'Loja não identificada no token' });
    }

    const loja = await Loja.findOne({
      where: {
        id: req.lojaId,
        ativa: true
      }
    });

    if (!loja) {
      return res.status(403).json({ error: 'Loja não encontrada ou inativa' });
    }

    req.loja = loja;
    req.lojaCNPJ = loja.cnpj;

    return next();

  } catch (err) {
    return res.status(500).json({ error: 'Erro ao validar loja' });
  }
};