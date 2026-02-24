const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pessoa, Clinica } = require('../models');

module.exports = {

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha obrigatórios' });
      }

      const user = await Pessoa.findOne({
        where: { email },
        include: [{ model: Clinica, as: 'clinica' }]
      });

      if (!user || !user.ativo) {
        return res.status(401).json({ error: 'Usuário inválido' });
      }

      const senhaValida = await bcrypt.compare(senha, user.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Senha inválida' });
      }

      // 🔐 TOKEN AGORA CARREGA A CLÍNICA
      const token = jwt.sign(
        {
          id: user.id,
          clinica_id: user.clinica_id,
          cargo: user.cargo,
          tipo: user.tipo
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        usuario: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          cargo: user.cargo,
          tipo: user.tipo,
          clinica_id: user.clinica_id
        }
      });

    } catch (err) {
      return res.status(500).json({ error: 'Erro no login' });
    }
  }

};