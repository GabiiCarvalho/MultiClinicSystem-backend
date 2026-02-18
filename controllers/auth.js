const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Loja } = require('../models');

module.exports = {
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      console.log('📝 Tentativa de login:', email);

      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const usuario = await Usuario.findOne({ 
        where: { email },
        include: [{ model: Loja, as: 'loja' }]
      });

      if (!usuario) {
        return res.status(400).json({ error: 'Usuário não encontrado' });
      }

      if (!usuario.ativo) {
        return res.status(400).json({ error: 'Usuário inativo' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
      if (!senhaValida) {
        return res.status(400).json({ error: 'Senha inválida' });
      }

      const token = jwt.sign(
        { 
          id: usuario.id, 
          nome: usuario.nome,
          email: usuario.email,
          cargo: usuario.cargo,
          loja_id: usuario.loja_id 
        },
        process.env.JWT_SECRET || 'segredo_temporario_para_desenvolvimento',
        { expiresIn: '7d' }
      );

      return res.json({
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          cargo: usuario.cargo,
          loja_id: usuario.loja_id,
          loja_nome: usuario.loja?.nome
        },
        token
      });
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async cadastrarUsuario(req, res) {
    try {
      const { 
        name, 
        email, 
        password, 
        confirmPassword, 
        phone, 
        cargo,
        cnpj,
        clinicName,
        address,
        especialidade,
        cro 
      } = req.body;

      console.log('📝 Cadastro de usuário:', { email, cargo, clinicName });

      if (!name || !email || !password || !cargo) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Senhas não coincidem' });
      }

      if (cargo === 'dentista' && (!especialidade || !cro)) {
        return res.status(400).json({ error: 'Dentista precisa de especialidade e CRO' });
      }

      let loja;
      
      if (cargo === 'gestor') {
        if (!clinicName || !address || !phone || !cnpj) {
          return res.status(400).json({ error: 'Dados da clínica são obrigatórios para gestor' });
        }

        const lojaExistente = await Loja.findOne({ where: { cnpj } });
        if (lojaExistente) {
          return res.status(400).json({ error: 'CNPJ já cadastrado' });
        }

        loja = await Loja.create({
          nome: clinicName,
          endereco: address,
          telefone: phone,
          email: email,
          cnpj: cnpj,
          ativa: true
        });
      } else {
        if (!cnpj) {
          return res.status(400).json({ error: 'CNPJ da clínica é obrigatório' });
        }

        loja = await Loja.findOne({ where: { cnpj } });
        if (!loja) {
          return res.status(400).json({ error: 'Clínica não encontrada com este CNPJ' });
        }
      }

      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const salt = await bcrypt.genSalt(10);
      const senha_hash = await bcrypt.hash(password, salt);

      const novoUsuario = await Usuario.create({
        nome: name,
        email,
        senha_hash,
        cargo,
        especialidade: cargo === 'dentista' ? especialidade : null,
        cro: cargo === 'dentista' ? cro : null,
        loja_id: loja.id,
        ativo: true
      });

      console.log('✅ Usuário criado:', novoUsuario.id, 'na loja:', loja.id);

      return res.status(201).json({
        message: 'Usuário cadastrado com sucesso',
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          cargo: novoUsuario.cargo,
          loja_id: loja.id,
          loja_nome: loja.nome
        }
      });
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async listarUsuariosPorLoja(req, res) {
    try {
      const { lojaId } = req;
      const usuarios = await Usuario.findAll({
        where: { loja_id: lojaId, ativo: true },
        attributes: ['id', 'nome', 'email', 'cargo', 'especialidade', 'cro'],
        order: [['nome', 'ASC']]
      });

      return res.json(usuarios);
    } catch (error) {
      console.error('❌ Erro ao listar usuários:', error);
      return res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }
};