const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pessoa, Loja } = require('../models');

module.exports = {
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      console.log('📝 Tentativa de login:', email);

      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const pessoa = await Pessoa.findOne({ 
        where: { email },
        include: [{ model: Loja, as: 'loja' }]
      });

      if (!pessoa) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      if (!pessoa.ativo) {
        return res.status(401).json({ error: 'Usuário inativo' });
      }

      // Verificar senha
      // Por enquanto, aceita 123456 para teste
      // Depois implementar bcrypt
      if (senha !== '123456') {
        // Se tiver senha no banco, verificar
        if (pessoa.senha && senha !== pessoa.senha) {
          return res.status(401).json({ error: 'Senha inválida' });
        }
      }

      const token = jwt.sign(
        { 
          id: pessoa.id, 
          nome: pessoa.nome,
          email: pessoa.email,
          tipo: pessoa.tipo,
          cargo: pessoa.cargo,
          loja_id: pessoa.loja_id 
        },
        process.env.JWT_SECRET || 'segredo_temporario',
        { expiresIn: '7d' }
      );

      console.log('✅ Login bem-sucedido:', pessoa.nome);

      return res.json({
        usuario: {
          id: pessoa.id,
          nome: pessoa.nome,
          email: pessoa.email,
          telefone: pessoa.telefone,
          tipo: pessoa.tipo,
          cargo: pessoa.cargo,
          loja_id: pessoa.loja_id,
          loja_nome: pessoa.loja?.nome
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
        phone,
        tipo,
        cargo,
        cpf_cnpj,
        especialidade,
        cro,
        clinicName,
        address,
        cnpj
      } = req.body;

      console.log('📝 Dados recebidos:', { 
        name, email, phone, tipo, cargo, clinicName 
      });

      if (!name || !email || !phone) {
        return res.status(400).json({ 
          error: 'Nome, email e telefone são obrigatórios' 
        });
      }

      const usuarioExistente = await Pessoa.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      let tipoUsuario = tipo || 'paciente';
      let cargoUsuario = cargo || null;
      let lojaId = 1;

      if (cargo === 'gestor' || tipo === 'gestor') {
        tipoUsuario = 'gestor';
        cargoUsuario = 'gestor';
        
        let loja = await Loja.findOne({ where: { cnpj } });
        
        if (!loja) {
          loja = await Loja.create({
            nome: clinicName || 'Clínica',
            endereco: address || '',
            telefone: phone,
            email: email,
            cnpj: cnpj || '00000000000000',
            ativa: true
          });
          console.log('✅ Loja criada:', loja.id);
        }
        
        lojaId = loja.id;
      }

      // Hash da senha (implementar depois)
      // const senhaHash = await bcrypt.hash(password, 10);

      const usuario = await Pessoa.create({
        nome: name,
        email: email,
        telefone: phone,
        senha: password || '123456', // Salva a senha diretamente por enquanto
        cpf_cnpj: cpf_cnpj || null,
        tipo: tipoUsuario,
        cargo: cargoUsuario,
        especialidade: especialidade || null,
        cro: cro || null,
        loja_id: lojaId,
        ativo: true
      });

      console.log('✅ Usuário criado:', usuario.id);

      const usuarioJson = usuario.toJSON();
      delete usuarioJson.senha;

      return res.status(201).json({
        message: 'Usuário cadastrado com sucesso',
        usuario: usuarioJson
      });
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Erro de validação',
          details: error.errors.map(e => e.message)
        });
      }
      
      return res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
  }
};