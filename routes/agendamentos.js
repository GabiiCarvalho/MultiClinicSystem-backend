const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const auth = require('../middlewares/auth');
const { Agendamento, Paciente, Usuario } = require('../models');

router.use(auth);

/**
 * GET /api/agendamentos?data=YYYY-MM-DD
 */
router.get('/', async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({ error: 'Data é obrigatória' });
    }

    const inicio = new Date(`${data}T00:00:00.000Z`);
    const fim = new Date(`${data}T23:59:59.999Z`);

    const agendamentos = await Agendamento.findAll({
      where: {
        clinica_id: req.clinica_id,
        data_hora: {
          [Op.between]: [inicio, fim]
        }
      },
      include: [
        { model: Paciente },
        { model: Usuario }
      ],
      order: [['data_hora', 'ASC']]
    });

    res.json(agendamentos);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});


/**
 * POST /api/agendamentos
 */
router.post('/', async (req, res) => {
  try {
    const {
      paciente_id,
      usuario_id,
      data_hora,
      data_hora_fim,
      valor
    } = req.body;

    const novoAgendamento = await Agendamento.create({
      paciente_id,
      usuario_id,
      data_hora,
      data_hora_fim,
      valor,
      status: 'agendado',
      clinica_id: req.clinica_id
    });

    res.status(201).json(novoAgendamento);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});


/**
 * PATCH /api/agendamentos/:id/status
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const agendamento = await Agendamento.findOne({
      where: {
        id: req.params.id,
        clinica_id: req.clinica_id
      }
    });

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    agendamento.status = status;
    await agendamento.save();

    res.json({ message: 'Status atualizado com sucesso' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});


/**
 * PATCH /api/agendamentos/:id/data
 * Atualizar horário (drag & drop)
 */
router.patch('/:id/data', async (req, res) => {
  try {
    const { data_hora, data_hora_fim } = req.body;

    const agendamento = await Agendamento.findOne({
      where: {
        id: req.params.id,
        clinica_id: req.clinica_id
      }
    });

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    agendamento.data_hora = data_hora;
    agendamento.data_hora_fim = data_hora_fim;
    await agendamento.save();

    res.json({ message: 'Horário atualizado com sucesso' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar horário' });
  }
});


/**
 * DELETE /api/agendamentos/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const agendamento = await Agendamento.findOne({
      where: {
        id: req.params.id,
        clinica_id: req.clinica_id
      }
    });

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    await agendamento.destroy();

    res.json({ message: 'Agendamento removido com sucesso' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao remover agendamento' });
  }
});

module.exports = router;