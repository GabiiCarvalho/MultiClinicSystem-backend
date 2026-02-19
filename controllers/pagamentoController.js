const { Pagamento, PagamentoItem, Agendamento, Pessoa, sequelize } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  async criarPagamento(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { lojaId, userId } = req;
      const { 
        paciente_id, 
        agendamentos, 
        subtotal, 
        desconto, 
        total, 
        forma_pagamento,
        recebido,
        troco
      } = req.body;

      const paciente = await Pessoa.findOne({ 
        where: { id: paciente_id, loja_id: lojaId, tipo: 'paciente' } 
      });
      
      if (!paciente) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Paciente não encontrado' });
      }

      const agendamentosValidos = await Agendamento.findAll({
        where: {
          id: { [Op.in]: agendamentos.map(a => a.agendamento_id) },
          loja_id: lojaId,
          paciente_id,
          pagamento_status: 'pendente'
        }
      });

      if (agendamentosValidos.length !== agendamentos.length) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Alguns agendamentos não podem ser pagos' });
      }

      const pagamento = await Pagamento.create({
        paciente_id,
        usuario_id: userId,
        subtotal,
        desconto: desconto || 0,
        total,
        forma_pagamento,
        recebido: recebido || total,
        troco: troco || 0,
        loja_id: lojaId
      }, { transaction });

      for (const item of agendamentos) {
        await PagamentoItem.create({
          pagamento_id: pagamento.id,
          agendamento_id: item.agendamento_id,
          procedimento_nome: item.procedimento_nome,
          procedimento_descricao: item.procedimento_descricao,
          valor: item.valor
        }, { transaction });

        await Agendamento.update(
          { 
            pagamento_status: 'pago',
            pagamento_id: pagamento.id 
          },
          { 
            where: { id: item.agendamento_id },
            transaction 
          }
        );
      }

      await transaction.commit();

      const pagamentoCompleto = await Pagamento.findByPk(pagamento.id, {
        include: [
          { model: Pessoa, as: 'paciente', attributes: ['id', 'nome', 'telefone', 'email'] },
          { model: Pessoa, as: 'usuario', attributes: ['id', 'nome'] },
          { model: PagamentoItem, as: 'itens' }
        ]
      });

      return res.status(201).json(pagamentoCompleto);
    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao criar pagamento:', error);
      return res.status(500).json({ error: 'Erro ao processar pagamento' });
    }
  },

  async listarPagamentos(req, res) {
    try {
      const { lojaId } = req;
      const { data_inicio, data_fim, paciente_id, pagina = 1, limite = 20 } = req.query;

      const where = { loja_id: lojaId };

      if (data_inicio && data_fim) {
        where.data_pagamento = {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        };
      }

      if (paciente_id) {
        where.paciente_id = paciente_id;
      }

      const pagamentos = await Pagamento.findAndCountAll({
        where,
        include: [
          { model: Pessoa, as: 'paciente', attributes: ['id', 'nome', 'telefone'] },
          { model: PagamentoItem, as: 'itens', limit: 5 }
        ],
        order: [['data_pagamento', 'DESC']],
        limit: parseInt(limite),
        offset: (pagina - 1) * parseInt(limite)
      });

      return res.json({
        total: pagamentos.count,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(pagamentos.count / limite),
        pagamentos: pagamentos.rows
      });
    } catch (error) {
      console.error('Erro ao listar pagamentos:', error);
      return res.status(500).json({ error: 'Erro ao listar pagamentos' });
    }
  },

  async obterPagamento(req, res) {
    try {
      const { lojaId } = req;
      const { pagamentoId } = req.params;

      const pagamento = await Pagamento.findOne({
        where: { id: pagamentoId, loja_id: lojaId },
        include: [
          { model: Pessoa, as: 'paciente' },
          { model: Pessoa, as: 'usuario', attributes: ['id', 'nome'] },
          { 
            model: PagamentoItem, 
            as: 'itens',
            include: [{ model: Agendamento, as: 'agendamento' }]
          }
        ]
      });

      if (!pagamento) {
        return res.status(404).json({ error: 'Pagamento não encontrado' });
      }

      return res.json(pagamento);
    } catch (error) {
      console.error('Erro ao obter pagamento:', error);
      return res.status(500).json({ error: 'Erro ao obter pagamento' });
    }
  },

  async gerarComprovante(req, res) {
    try {
      const { lojaId } = req;
      const { pagamentoId } = req.params;

      const pagamento = await Pagamento.findOne({
        where: { id: pagamentoId, loja_id: lojaId },
        include: [
          { model: Pessoa, as: 'paciente' },
          { model: Pessoa, as: 'usuario', attributes: ['id', 'nome'] },
          { model: PagamentoItem, as: 'itens' }
        ]
      });

      if (!pagamento) {
        return res.status(404).json({ error: 'Pagamento não encontrado' });
      }

      return res.json({ pagamento });
    } catch (error) {
      console.error('Erro ao gerar comprovante:', error);
      return res.status(500).json({ error: 'Erro ao gerar comprovante' });
    }
  },

  async enviarWhatsApp(req, res) {
    try {
      const { lojaId } = req;
      const { pagamentoId } = req.params;

      const pagamento = await Pagamento.findOne({
        where: { id: pagamentoId, loja_id: lojaId },
        include: [
          { model: Pessoa, as: 'paciente' },
          { model: PagamentoItem, as: 'itens' }
        ]
      });

      if (!pagamento) {
        return res.status(404).json({ error: 'Pagamento não encontrado' });
      }

      const telefone = pagamento.paciente.telefone.replace(/\D/g, '');
      
      let mensagem = `*Comprovante de Pagamento*\n\n`;
      mensagem += `Olá *${pagamento.paciente.nome}*,\n`;
      mensagem += `Seu pagamento foi confirmado!\n\n`;
      mensagem += `📅 Data: ${new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR')}\n`;
      mensagem += `💰 Total: R$ ${parseFloat(pagamento.total).toFixed(2)}\n`;
      mensagem += `💳 Forma: ${pagamento.forma_pagamento.toUpperCase()}\n\n`;
      mensagem += `*Procedimentos:*\n`;
      
      pagamento.itens.forEach(item => {
        mensagem += `• ${item.procedimento_nome} - R$ ${parseFloat(item.valor).toFixed(2)}\n`;
      });
      
      mensagem += `\n✅ Pagamento confirmado com sucesso!`;

      const link = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

      await pagamento.update({ whatsapp_enviado: true });

      return res.json({ link, mensagem });
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      return res.status(500).json({ error: 'Erro ao enviar comprovante' });
    }
  }
};