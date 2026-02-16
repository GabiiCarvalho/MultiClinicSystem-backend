const { Usuario, Loja } = require('../models');
const bcrypt = require('bcryptjs');

module.exports = {
  async criarUsuario(req, res) {
    try {
      const { lojaId } = req;
      const { nome, email, senha, cargo, especialidade, cro } = req.body;

      console.log(`📝 Cadastrando novo usuário: ${email} com cargo: ${cargo}`);

      // Verifica permissões
      if (req.userCargo !== 'proprietario' && req.userCargo !== 'gestor') {
        return res.status(403).json({ error: 'Apenas proprietários e gestores podem criar usuários' });
      }

      // Verifica se email já existe
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Validações específicas por cargo
      if (cargo === 'dentista') {
        if (!especialidade || !cro) {
          return res.status(400).json({ error: 'Dentista deve ter especialidade e CRO' });
        }
        
        const croExistente = await Usuario.findOne({ where: { cro } });
        if (croExistente) {
          return res.status(400).json({ error: 'CRO já cadastrado' });
        }
      }

      // Criptografa senha
      const senha_hash = await bcrypt.hash(senha, 8);

      const usuario = await Usuario.create({
        nome,
        email,
        senha_hash,
        cargo,
        especialidade: cargo === 'dentista' ? especialidade : null,
        cro: cargo === 'dentista' ? cro : null,
        loja_id: lojaId,
        ativo: true
      });

      const usuarioJson = usuario.toJSON();
      delete usuarioJson.senha_hash;

      console.log('✅ Usuário cadastrado com sucesso:', usuario.email);

      res.status(201).json(usuarioJson);
    } catch (error) {
      console.error('❌ Erro ao cadastrar usuário:', error);
      res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
  },

  async listarUsuariosPorCargo(req, res) {
    try {
      const { lojaId } = req;
      const { cargo } = req.query;

      const where = { loja_id: lojaId };
      if (cargo) where.cargo = cargo;

      const usuarios = await Usuario.findAll({
        where,
        attributes: { exclude: ['senha_hash'] },
        order: [['nome', 'ASC']]
      });

      res.json(usuarios);
    } catch (error) {
      console.error('❌ Erro ao listar usuários:', error);
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  },

  async listarDentistas(req, res) {
    try {
      const { lojaId } = req;

      const dentistas = await Usuario.findAll({
        where: { 
          loja_id: lojaId,
          cargo: 'dentista',
          ativo: true
        },
        attributes: ['id', 'nome', 'especialidade', 'cro', 'email'],
        order: [['nome', 'ASC']]
      });

      res.json(dentistas);
    } catch (error) {
      console.error('❌ Erro ao listar dentistas:', error);
      res.status(500).json({ error: 'Erro ao listar dentistas' });
    }
  }
};