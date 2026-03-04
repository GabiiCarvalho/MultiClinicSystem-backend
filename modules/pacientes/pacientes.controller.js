const e = require('express');
const database = require('../../config/database');

/**
 * GET /pacientes
 * - dentista/esteticista: só pacientes com agendamento apra eles
 * - demais: todos da clínica
 */

const listarPacientes = async (req, res) => {
    const { clinica_id, cargo, id: userId } = req.user;
    const { busca } = req.query;

    try {
        const isDentista = ['dentista', 'esteticista'].includes(cargo);

        let query;
        const values = [clinica_id];
        let p = 2;

        if (isDentista) {
            // Só pacientes que têm agendamento com este profissional
            query = `SELECT DISTINCT p.id, p.nome, p.telefone, p.email, p.cpf, p.data_nascimento, p.observacoes, p.created_at FROM pacientes p JOIN agendamentos a ON a.paciente_id = p.id WHERE p.clinica_id = $1 AND a.profissional_id = $${p++}`;
        }

        if (busca) {
            query += ` AND (p.nome ILIKE $${p} OR p.telefone ILIKE $${p} OR p.email ILIKE $${p})`;
            values.push(`%${busca}%`);
            p++;
        }

        query += ' ORDER BY nome ASC';

        const { rows } = await database.query(query, values);
        res.json(rows);
    } catch (error) {
        console.error('Erro listar pacientes: ', error);
        res.status(500).json({ error: 'Erro ao buscar pacientes' });
    }
};

/**
 * GET /pacientes/:id
 */

const getPaciente = async (req, res) => {
    const { clinica_id, cargo, id: userId } = req.user;
    const { id } = req.params;

    try {
        const { rows } = await database.query(
            'SELECT * FROM pacientes WHERE id = $1 AND clinica_id = $2',
            [id, clinica_id]
        );
        if (!rows[0]) return res.status(404).json({ error: 'Paciente não encontrado' });

        // Dentista: verifica se tem agendamento com este paciente
        if (['dentista', 'esteticista'].includes(cargo)) {
            const { rows: check } = await database.query(
                'SELECT id FROM agendamentos WHERE paciente_id = $1 AND profissional_id = $2 AND clinica_id = $3 LIMIT 1',
                [id, userId, clinica_id]
            );
            if (!check.length) return res.status(403).json({ error: 'Acesso negado a este paciente' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar paciente' });
    }
};

/**
 * POST /pacientes
 */

const criarPaciente = async (req, res) => {
    const { clinica_id } = req.user;
    const { nome, telefone, email, cpf, data_nascimento, observacoes } = req.body;

    if (!nome) return res.status(400).json({ error: 'Nome obrigatório' });

    try {
        const { rows } = await database.query(
            `INSERT INTO pacientes (clinica_id, nome, telefone, email, cpf, data_nascimento, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [clinica_id, nome, telefone, email, cpf, data_nascimento || null, observacoes]
        );
        res.status(201).json([0]);
    } catch (error) {
        console.error('Erro ao criar paciente', error);
        res.status(500).json({ error: 'Erro ao criar paciente' });
    }
};

/**
 * PATCH /pacientes/:id
 */

const atualizarPaciente = async (req, res) => {
    const { clinica_id } = req.user;
    const { id } = req.params;
    const { nome, telefone, email, cpf, data_nascimento, observacoes, status, data_hora, pago } = req.body;

    try {
        const { rows: check } = await database.query(
            'SELECT id FROM pacientes WHERE id = $1 AND clinica_id = $2',
            [id, clinica_id]
        );
        if (!check.length) return res.status(404).json({ error: 'Paciente não encontrado' });

        const updates = [];
        const values = [];
        let p = 1;

        if (nome) { updates.push(`nome = $${p++}`); values.push(nome); }
        if (telefone) { updates.push(`telefone = $${p++}`); values.push(telefone); }
        if (email) { updates.push(`email = $${p++}`); values.push(email); }
        if (cpf) { updates.push(`cpf = $${p++}`); values.push(cpf); }
        if (data_nascimento) { updates.push(`data_nascimento = $${p++}`); values.push(data_nascimento); }
        if (observacoes !== undefined) { updates.push(`observacoes =$${p++}`); values.push(observacoes); }

        if (!updates.length) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

        values.push(id, clinica_id);
        const { rows } = await database.query(
            `UPDATE pacientes SET ${updates.join(', ')} WHERE id = $${p++} AND clinica_id = $${p} RETURNING*`,
            values
        );
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar paciente' });
    }
};

/**
 * PATCH /pacientes/:id/data
 * Usado pelo CalendarSaaS ao fazer Drag&Drop
 */

const atualizarData = async (req, res) => {
    const { clinica_id } = req.user;
    const { id } = req.params;
    const { data_hora } = req.body;

    if (!data_hora) return res.status(400).json({ error: 'data_hora obrigatória' });

    try {
        // Atualiza no agendamento mais recente deste paciente
        const { rows } = await database.query(
            `UPDATE agendamentos SET data_hora = $1, updated_at = NOW() WHERE paciente_id = $2 AND clinica_id = $3 AND status NOT IN ('finalizado', 'cancelado') RETURNING *`,
            [data_hora, id, clinica_id]
        );

        if (!rows.length) return res.status(404).json({ error: 'Agendamento ativo não encontrado' });
        res.json(rows[0]);
    } catch (error) {
        console.error('Erro atualizar data paciente:', error);
        res.status(500).json({ error: 'Erro ao reagendar' });
    }
};

module.exports = { listarPacientes, getPaciente, criarPaciente, atualizarPaciente, atualizarData };