const { Pessoa, Loja } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = {
  // Listar todos os colaboradores da loja
  async listarColaboradores(req, res) {
    try {
      const { lojaId } = req;
      
      const colaboradores = await Pessoa.findAll({
        where: { 
          loja_id: lojaId,
          tipo: { [Op.in]: ['gestor', 'dentista', 'atendente', 'financeiro', 'proprietario'] }
        },
        attributes: { exclude: ['senha'] },
        order: [['nome', 'ASC']]
      });

      return res.json(colaboradores);
    } catch (error) {
      console.error('Erro ao listar colaboradores:', error);
      return res.status(500).json({ error: 'Erro ao listar colaboradores' });
    }
  },

  // Criar novo colaborador
  async criarColaborador(req, res) {
    try {
      const { lojaId, userId } = req;
      const { 
        nome, email, telefone, whatsapp, cpf, endereco,
        cargo, especialidade, cro, biografia, senha
      } = req.body;

      // Verificar se já existe usuário com este email na mesma loja
      const usuarioExistente = await Pessoa.findOne({ 
        where: { 
          email,
          loja_id: lojaId
        } 
      });

      if (usuarioExistente) {
        return res.status(400).json({ error: 'Email já cadastrado nesta clínica' });
      }

      // Verificar se CRO já existe (para dentistas)
      if (cargo === 'dentista' && cro) {
        const croExistente = await Pessoa.findOne({ where: { cro } });
        if (croExistente) {
          return res.status(400).json({ error: 'CRO já cadastrado' });
        }
      }

      // Hash da senha se fornecida
      let senhaHash = null;
      if (senha) {
        const salt = await bcrypt.genSalt(10);
        senhaHash = await bcrypt.hash(senha, salt);
      }

      // Mapear cargo para tipo
      const tipoMap = {
        'gestor': 'gestor',
        'dentista': 'dentista',
        'atendente': 'atendente',
        'financeiro': 'financeiro',
        'proprietario': 'proprietario'
      };

      const novoColaborador = await Pessoa.create({
        nome,
        email,
        senha: senhaHash,
        telefone,
        whatsapp: whatsapp || telefone,
        cpf,
        endereco,
        tipo: tipoMap[cargo] || cargo,
        cargo,
        especialidade: cargo === 'dentista' ? especialidade : null,
        cro: cargo === 'dentista' ? cro : null,
        biografia,
        loja_id: lojaId,
        ativo: true
      });

      const colaboradorJson = novoColaborador.toJSON();
      delete colaboradorJson.senha;

      return res.status(201).json(colaboradorJson);
    } catch (error) {
      console.error('Erro ao criar colaborador:', error);
      return res.status(500).json({ error: 'Erro ao criar colaborador' });
    }
  },

  // Atualizar colaborador
  async atualizarColaborador(req, res) {
    try {
      const { lojaId } = req;
      const { id } = req.params;
      const updateData = req.body;

      const colaborador = await Pessoa.findOne({ 
        where: { 
          id, 
          loja_id: lojaId 
        } 
      });

      if (!colaborador) {
        return res.status(404).json({ error: 'Colaborador não encontrado' });
      }

      // Remover campos que não devem ser atualizados diretamente
      delete updateData.id;
      delete updateData.loja_id;
      delete updateData.senha;

      await colaborador.update(updateData);

      const colaboradorJson = colaborador.toJSON();
      delete colaboradorJson.senha;

      return res.json(colaboradorJson);
    } catch (error) {
      console.error('Erro ao atualizar colaborador:', error);
      return res.status(500).json({ error: 'Erro ao atualizar colaborador' });
    }
  },

  // Deletar colaborador (soft delete)
  async deletarColaborador(req, res) {
    try {
      const { lojaId } = req;
      const { id } = req.params;

      const colaborador = await Pessoa.findOne({ 
        where: { 
          id, 
          loja_id: lojaId 
        } 
      });

      if (!colaborador) {
        return res.status(404).json({ error: 'Colaborador não encontrado' });
      }

      // Soft delete - apenas marca como inativo
      await colaborador.update({ ativo: false });

      return res.json({ message: 'Colaborador removido com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar colaborador:', error);
      return res.status(500).json({ error: 'Erro ao deletar colaborador' });
    }
  },

  // Buscar colaborador por ID
  async buscarColaborador(req, res) {
    try {
      const { lojaId } = req;
      const { id } = req.params;

      const colaborador = await Pessoa.findOne({ 
        where: { 
          id, 
          loja_id: lojaId,
          tipo: { [Op.in]: ['gestor', 'dentista', 'atendente', 'financeiro', 'proprietario'] }
        },
        attributes: { exclude: ['senha'] }
      });

      if (!colaborador) {
        return res.status(404).json({ error: 'Colaborador não encontrado' });
      }

      return res.json(colaborador);
    } catch (error) {
      console.error('Erro ao buscar colaborador:', error);
      return res.status(500).json({ error: 'Erro ao buscar colaborador' });
    }
  },

  // Listar apenas dentistas
  async listarDentistas(req, res) {
    try {
      const { lojaId } = req;

      const dentistas = await Pessoa.findAll({
        where: { 
          loja_id: lojaId,
          tipo: 'dentista',
          ativo: true
        },
        attributes: ['id', 'nome', 'especialidade', 'cro', 'email', 'telefone', 'whatsapp', 'biografia'],
        order: [['nome', 'ASC']]
      });

      return res.json(dentistas);
    } catch (error) {
      console.error('Erro ao listar dentistas:', error);
      return res.status(500).json({ error: 'Erro ao listar dentistas' });
    }
  }
};