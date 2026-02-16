const { Loja } = require('../models');

module.exports = {
  async listar(req, res) {
    try {
      // Apenas proprietários e gestores podem listar lojas
      if (req.userCargo !== 'proprietario' && req.userCargo !== 'gestor') {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      const lojas = await Loja.findAll({
        where: { ativa: true },
        attributes: ['id', 'nome', 'telefone', 'email', 'endereco', 'cnpj']
      });
      return res.json(lojas);
    } catch (error) {
      console.error('Erro ao listar lojas:', error);
      return res.status(500).json({ error: 'Erro ao listar lojas' });
    }
  },

  async obterPorId(req, res) {
    try {
      const { lojaId } = req.params;
      const loja = await Loja.findByPk(lojaId);

      if (!loja) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }

      // Verifica se o usuário tem permissão para acessar esta loja
      if (req.lojaId !== loja.id && req.userCargo !== 'proprietario' && req.userCargo !== 'gestor') {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      return res.json(loja);
    } catch (error) {
      console.error('Erro ao obter loja:', error);
      return res.status(500).json({ error: 'Erro ao obter loja' });
    }
  },

  async atualizar(req, res) {
    try {
      const { lojaId } = req.params;
      
      // Apenas proprietários da loja podem atualizá-la
      if (req.lojaId !== parseInt(lojaId) && req.userCargo !== 'proprietario') {
        return res.status(403).json({ error: 'Acesso não autorizado' });
      }

      const loja = await Loja.findByPk(lojaId);
      if (!loja) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }

      const { nome, endereco, telefone, email, cnpj } = req.body;
      await loja.update({ nome, endereco, telefone, email, cnpj });

      return res.json(loja);
    } catch (error) {
      console.error('Erro ao atualizar loja:', error);
      return res.status(500).json({ error: 'Erro ao atualizar loja' });
    }
  },

  async estatisticas(req, res) {
    try {
      const { lojaId } = req;

      const loja = await Loja.findByPk(lojaId);
      if (!loja) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }

      // Estatísticas básicas da loja
      const stats = {
        nome: loja.nome,
        total_usuarios: await loja.countUsuarios(),
        total_pacientes: await loja.countPacientes(),
        total_procedimentos: await loja.countProcedimentos(),
        total_agendamentos_hoje: await loja.countAgendamentos({
          where: {
            data_hora: {
              [Op.between]: [moment().startOf('day').toDate(), moment().endOf('day').toDate()]
            }
          }
        })
      };

      return res.json(stats);
    } catch (error) {
      console.error('Erro ao obter estatísticas da loja:', error);
      return res.status(500).json({ error: 'Erro ao obter estatísticas da loja' });
    }
  }
};