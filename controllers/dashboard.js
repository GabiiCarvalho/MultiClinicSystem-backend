const { 
  Agendamento, 
  Paciente, 
  Dentista, 
  Procedimento,
  Venda,
  Categoria,
  Sequelize 
} = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

module.exports = {
  async getDashboardData(req, res) {
    try {
      const { lojaId } = req;
      const { periodo = 'semana' } = req.query;

      // Configura período para filtros
      let startDate, endDate;
      switch (periodo) {
        case 'dia':
          startDate = moment().startOf('day').toDate();
          endDate = moment().endOf('day').toDate();
          break;
        case 'semana':
          startDate = moment().startOf('week').toDate();
          endDate = moment().endOf('week').toDate();
          break;
        case 'mes':
          startDate = moment().startOf('month').toDate();
          endDate = moment().endOf('month').toDate();
          break;
        default:
          startDate = moment().startOf('week').toDate();
          endDate = moment().endOf('week').toDate();
      }

      // Consultas paralelas para melhor performance
      const [
        totalPacientes,
        totalDentistas,
        totalProcedimentos,
        agendamentosHoje,
        agendamentosPeriodo,
        vendasPeriodo,
        procedimentosPopulares,
        statusAgendamentos
      ] = await Promise.all([
        // Total de pacientes cadastrados
        Paciente.count({ where: { loja_id: lojaId } }),

        // Total de dentistas ativos
        Dentista.count({ where: { loja_id: lojaId, ativo: true } }),

        // Total de procedimentos ativos
        Procedimento.count({ where: { loja_id: lojaId, ativo: true } }),

        // Agendamentos para hoje
        Agendamento.findAll({
          where: {
            loja_id: lojaId,
            data_hora: {
              [Op.between]: [
                moment().startOf('day').toDate(),
                moment().endOf('day').toDate()
              ]
            }
          },
          include: [
            { model: Paciente, attributes: ['id', 'nome'] },
            { model: Dentista, attributes: ['id', 'nome'] }
          ],
          order: [['data_hora', 'ASC']]
        }),

        // Agendamentos no período selecionado
        Agendamento.findAll({
          where: {
            loja_id: lojaId,
            data_hora: { [Op.between]: [startDate, endDate] }
          },
          attributes: [
            [Sequelize.fn('date', Sequelize.col('data_hora')), 'data'],
            [Sequelize.fn('count', Sequelize.col('id')), 'total']
          ],
          group: ['data'],
          raw: true
        }),

        // Vendas no período
        Venda.findAll({
          where: {
            loja_id: lojaId,
            data_hora: { [Op.between]: [startDate, endDate] }
          },
          attributes: [
            [Sequelize.fn('date', Sequelize.col('data_hora')), 'data'],
            [Sequelize.fn('sum', Sequelize.col('total')), 'total']
          ],
          group: ['data'],
          raw: true
        }),

        // Procedimentos mais populares
        Procedimento.findAll({
          where: { loja_id: lojaId },
          include: [{
            association: 'AgendamentoItens',
            attributes: [],
            required: true,
            include: [{
              association: 'Agendamento',
              where: { loja_id: lojaId }
            }]
          }],
          attributes: [
            'id',
            'nome',
            [Sequelize.fn('COUNT', Sequelize.col('AgendamentoItens.id')), 'total']
          ],
          group: ['Procedimento.id'],
          order: [[Sequelize.literal('total'), 'DESC']],
          limit: 5
        }),

        // Status dos agendamentos
        Agendamento.findAll({
          where: { loja_id: lojaId },
          attributes: [
            'status',
            [Sequelize.fn('count', Sequelize.col('id')), 'total']
          ],
          group: ['status'],
          raw: true
        })
      ]);

      // Formata dados para o dashboard
      const dashboardData = {
        metricas: {
          totalPacientes,
          totalDentistas,
          totalProcedimentos,
          agendamentosHoje: agendamentosHoje.length,
          faturamentoPeriodo: vendasPeriodo.reduce((sum, item) => sum + parseFloat(item.total), 0)
        },
        graficos: {
          agendamentosPorDia: agendamentosPeriodo.map(item => ({
            data: moment(item.data).format('DD/MM'),
            total: item.total
          })),
          vendasPorDia: vendasPeriodo.map(item => ({
            data: moment(item.data).format('DD/MM'),
            total: parseFloat(item.total)
          })),
          statusAgendamentos: statusAgendamentos.map(item => ({
            status: item.status,
            total: item.total
          }))
        },
        procedimentosPopulares: procedimentosPopulares.map(procedimento => ({
          id: procedimento.id,
          nome: procedimento.nome,
          total: procedimento.dataValues.total
        })),
        proximosAgendamentos: agendamentosHoje
          .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora))
          .slice(0, 5)
          .map(agendamento => ({
            id: agendamento.id,
            data_hora: moment(agendamento.data_hora).format('HH:mm'),
            paciente: agendamento.Paciente.nome,
            dentista: agendamento.Dentista.nome,
            status: agendamento.status
          }))
      };

      res.json(dashboardData);
    } catch (error) {
      console.error('Erro no dashboard:', error);
      res.status(500).json({ error: 'Erro ao carregar dados do dashboard' });
    }
  },

  async getFinancialOverview(req, res) {
    try {
      const { lojaId } = req;
      const { meses = 6 } = req.query;

      const startDate = moment().subtract(meses, 'months').startOf('month');
      const endDate = moment().endOf('month');

      const financialData = await Venda.findAll({
        where: {
          loja_id: lojaId,
          data_hora: { [Op.between]: [startDate.toDate(), endDate.toDate()] }
        },
        attributes: [
          [Sequelize.fn('date_trunc', 'month', Sequelize.col('data_hora')), 'mes'],
          [Sequelize.fn('sum', Sequelize.col('total')), 'total'],
          [Sequelize.fn('count', Sequelize.col('id')), 'vendas']
        ],
        group: ['mes'],
        order: [['mes', 'ASC']],
        raw: true
      });

      const formattedData = financialData.map(item => ({
        mes: moment(item.mes).format('MMM/YY'),
        total: parseFloat(item.total),
        vendas: item.vendas
      }));

      const monthsArray = [];
      let currentDate = startDate.clone();
      
      while (currentDate.isBefore(endDate)) {
        const monthStr = currentDate.format('MMM/YY');
        const existingData = formattedData.find(d => d.mes === monthStr);
        
        monthsArray.push(existingData || {
          mes: monthStr,
          total: 0,
          vendas: 0
        });
        
        currentDate.add(1, 'month');
      }

      res.json(monthsArray);
    } catch (error) {
      console.error('Erro no overview financeiro:', error);
      res.status(500).json({ error: 'Erro ao carregar dados financeiros' });
    }
  }
};