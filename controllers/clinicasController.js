const { Clinica, Sequelize } = require('../models');
const { Op } = Sequelize;
const moment = require('moment');

module.exports = {
  // Listar clínicas (apenas proprietário do sistema)
  async listar(req, res) {
    try {
      if (req.userCargo !== 'proprietario') {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      const clinicas = await Clinica.findAll({
        where: { ativa: true },
        attributes: ['id', 'nome', 'telefone', 'email', 'endereco', 'cnpj', 'createdAt']
      });

      return res.json(clinicas);
    } catch (error) {
      console.error('Erro ao listar clínicas:', error);
      return res.status(500).json({ error: 'Erro ao listar clínicas' });
    }
  },

  // Obter clínica por ID
  async obterPorId(req, res) {
    try {
      const { clinicaId } = req.params;

      const clinica = await Clinica.findByPk(clinicaId);

      if (!clinica) {
        return res.status(404).json({ error: 'Clínica não encontrada' });
      }

      // Só pode acessar se for da própria clínica ou proprietário do sistema
      if (
        req.clinicaId !== parseInt(clinicaId) &&
        req.userCargo !== 'proprietario'
      ) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      return res.json(clinica);
    } catch (error) {
      console.error('Erro ao obter clínica:', error);
      return res.status(500).json({ error: 'Erro ao obter clínica' });
    }
  },

  // Atualizar clínica
  async atualizar(req, res) {
    try {
      const { clinicaId } = req.params;

      // Apenas proprietário da clínica ou proprietário do sistema
      if (
        req.clinicaId !== parseInt(clinicaId) &&
        req.userCargo !== 'proprietario'
      ) {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      const clinica = await Clinica.findByPk(clinicaId);

      if (!clinica) {
        return res.status(404).json({ error: 'Clínica não encontrada' });
      }

      const { nome, endereco, telefone, email, cnpj } = req.body;

      await clinica.update({
        nome,
        endereco,
        telefone,
        email,
        cnpj
      });

      return res.json(clinica);
    } catch (error) {
      console.error('Erro ao atualizar clínica:', error);
      return res.status(500).json({ error: 'Erro ao atualizar clínica' });
    }
  },

  // Estatísticas da clínica (isolamento por clinicaId)
  async estatisticas(req, res) {
    try {
      const clinicaId = req.clinicaId;

      const clinica = await Clinica.findByPk(clinicaId);

      if (!clinica) {
        return res.status(404).json({ error: 'Clínica não encontrada' });
      }

      const inicioDia = moment().startOf('day').toDate();
      const fimDia = moment().endOf('day').toDate();

      const stats = {
        nome: clinica.nome,
        total_usuarios: await clinica.countUsuarios(),
        total_pacientes: await clinica.countPacientes(),
        total_procedimentos: await clinica.countProcedimentos(),
        total_agendamentos_hoje: await clinica.countAgendamentos({
          where: {
            data_hora: {
              [Op.between]: [inicioDia, fimDia]
            }
          }
        })
      };

      return res.json(stats);
    } catch (error) {
      console.error('Erro ao obter estatísticas da clínica:', error);
      return res.status(500).json({ error: 'Erro ao obter estatísticas da clínica' });
    }
  }
};