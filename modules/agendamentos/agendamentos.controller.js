const database = require('../../config/database');

/**
 * ISOLAMENTO POR CARGO:
 * Dentista/Esteticista -> filtrar por profissional_id = req.user.id
 * gestor/atendente/financeiro -> visualizam todos da clínica
 */

const buildProfissionalFilter = (req) => {
    const { cargo, id } = req.user;
    if (['dentista', 'esteticista'].includes(cargo)) {
        return { filter: 'AND a.profissional_id = $PROF', profissionalId: id };
    }
    return { filter: '', profissionalId: null };
};

/**
 * GET /agendamentos?data=YYYY-MM-DD&profissional_id=X&status=Y
 */

const listarAgendamentos = async (req, res) => {
    const { clinica_id } = req.user;
    const { data, profissional_id, status, mes, ano } = req.query;

    try {
        const { cargo, id: userId } = req.user;
        const isDentista = ['dentista', 'esteticista'].includes(cargo);

        const conditions = ['a.clinica_id = $1'];
        const values = [clinica_id];
        let p = 2;

        // ISOLAMENTO: dentista/esteticista só vê os seus próprios agendamentos
        if (isDentista) {
            conditions.push(`a.profissional_id = $${p++}`);
            values.push(userId);
        } else if (profissional_id) {
            // Gestor/atendente/financeiro podem filtrar por profissional
            conditions.push(`a.profissional_id =$${p++}`);
            values.push(profissional_id);
        }

        // Filtro por data
        if (data) {
            conditions.push(`DATE(a.data_hora) = $${p++}`);
            values.push(data);
        } else if (mes && ano) {
            conditions.push(`EXTRACT(MONTH FROM a.data_hora) = $${p++}`);
            values.push(mes);
            conditions.push(`EXTRACT(YEAR FROM a.data_hora) = $${p++}`);
            values.push(ano);
        }

        // Filtro por status
        if (status && status !== 'todos') {
            conditions.push(`a.status = $${p++}`);
            values.push(status);
        } 

        const query = `
            SELECT 
                a.id, a.data_hora, a.data_hora_fim, a.status,
                a.valor, a.pago, a.observacoes, a.procedure_progress,
                a.motivo_cancelamento,
                -- Paciente
                json_build_object(
          'id',   pac.id,
          'nome', pac.nome,
          'telefone', pac.telefone,
          'email', pac.email
        ) AS paciente,
        -- Profissional
        json_build_object(
          'id',    prof.id,
          'nome',  prof.nome,
          'cargo', prof.cargo,
          'especialidade', prof.especialidade
        ) AS dentista,
        -- Procedimento
        json_build_object(
          'id',   proc.id,
          'nome', proc.nome,
          'tipo', proc.tipo,
          'duracao_min', proc.duracao_min
        ) AS procedimento
      FROM agendamentos a
      JOIN pacientes pac   ON pac.id  = a.paciente_id
      JOIN usuarios   prof ON prof.id = a.profissional_id
      LEFT JOIN procedimentos proc ON proc.id = a.procedimento_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY a.data_hora ASC
    `;

    const { rows } = await database.query(query, values);
    res.json(rows);
    } catch (error) {
        console.error('Erro ao listar agendamentos:', error);
        res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
};

/**
 * GET /agendamentos/:id
 * Verifica se dentista tem acesso a este agendamento
 */
const getAgendamento = async (req, res) => {
  const { clinica_id, cargo, id: userId } = req.user;
  const { id } = req.params;

    try {
        const { rows } = await database.query(
            `SELECT a.*, pac.nome AS paciente_nome, prof.nome AS profissional_nome
            FROM agendamentos a
            JOIN pacientes pac ON pac.id = a.paciente_id
            JOIN usuarios prof ON prof.id = a.profissional_id
            WHERE a.id = $1 AND a.clinica_id = $2`,
            [id, clinica_id]
        );

        if (!rows[0]) return res.status(404).json({ error: 'Agendamento não encontrado' });

        // ISOLAMENTO: dentista/esteticista só pode acessar seus próprios agendamentos
        if (['dentista', 'esteticista'].includes(cargo)) {
            if (rows[0].profissional_id !== userId) {
                return res.status(403).json({ error: 'Acesso negado a este agendamento' });
            }
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar agendamento' });
    }
};

/**
 * POST /agendamentos
 * Criar novo agendamento - verifica conflito de horário
 */

const criarAgendamento = async (req, res) => {
    const { clinica_id, id: criado_por } = req.user;
    const { paciente_id, profissional_id, procedimento_id, data_hora, data_hora_fim, valor, observacoes } = req.body;

    try {
        // Verifica se profissional pertence à mesma clínica
        const { rows: profCheck } = await database.query(
            'SELECT id FROM usuarios WHERE id =$1 AND clinica_id = $2',
            [profissional_id, clinica_id]
        );
        if (!profCheck.length) {
            return res.status(400).json({ error: 'Profissional não pertence a esta clínica' });
        }

        // VERIFICAÇÃO DE CONFLITO DE HORÁRIO
        const { rows: conflito } = await database.query(
            `SELECT id FROM agendamentos
            WHERE profissional_id = $1
            AND data_hora < $3
            AND data_hora_fim > $2`,
            [profissional_id, data_hora, data_hora_fim || new Date(new Date(data_hora).getTime() + 60*60000).toISOString()]
        );

        if (conflito.length) {
            return res.status(409).json({ error: 'Conflito de horário', detail: 'Este profissional já possui agendamento neste horário' });
        }

        const { rows } = await database.query(
            `INSERT INTO agendamentos
            (clinica_id, paciente_id, profissional_id, procedimento_id, data_hora, data_hora_fim, valor, observacoes, criado_por)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [clinica_id, paciente_id, profissional_id, procedimento_id, data_hora, data_hora_fim, valor, observacoes, criado_por]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({ error: 'Erro ao criar agendamento' });
    }
};

/**
 * PATCH /agendamentos/:id/status
 */

const atualizarStatus = async (req, res) => {
    const { clinica_id, cargo, id: userId } = req.user;
    const { id } = req.params;
    const { status, motivo_cancelamento } = req.body;

    const statusValidos = ['agendado', 'confirmado', 'em_procedimento', 'finalizado', 'cancelado'];
    if (!statusValidos.includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
    }

    try {
        const { rows: check } = await database.query(
            'SELECT profissional_id FROM agendamentos WHERE id = $1 AND clinica_id = $2',
            [id, clinica_id]
        );
        if (!check.length) return res.status(404).json({ error: 'Não encontrado' });

        // ISOLAMENTO: dentista/esteticista só pode atualizar o seus próprios agendamentos
        if (['dentista', 'esteticista'].includes(cargo)) {
            if (check[0].profissional_id !== userId) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
        }
        const { rows } = await database.query(
            `UPDATE agendamentos SET status = $1, motivo_cancelamento = $2,
            updated_at = NOW() WHERE id = $3 AND clinica_id = $4 RETURNING *`,
            [status, motivo_cancelamento, id, clinica_id]
        );

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
};

/**
 * PATCH /agendamentos/:id/data
 * Drag & Drop no calendário - verificar conflito no novo horário
 */

const atualizarData = async (req, res) => {
    const { clinica_id, cargo, id: userId } = req.user;
    const { id } = req.params;
    const { data_hora, data_hora_fim } = req.body;

    try {
        const { rows: check } = await database.query(
            'SELECT profissional_id, data_hora_fim, data_hora FROM agendamentos WHERE id = $1 AND clinica_id = $2',
            [id, clinica_id]
        );
        if (!check.length) return res.status(404).json({ error: 'Não encontrado' });

        // ISOLAMENTO
        if (['dentista', 'esteticista'].includes(cargo)) {
            if (check[0].profissional_id !== userId) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
        }

        const profId = check[0].profissional_id;
        const duracao = new Date(check[0].data_hora_fim) - new Date(check[0].data_hora);
        const novoFim = data_hora_fim || new Date(new Date(data_hora).getTime() + duracao).toISOString();

        // VERIFICAÇÃO de conflito no novo horário
        const { rows: conflito } = await database.query(
            `SELECT id FROM agendamentos WHERE profissional_id = $1 AND id != $2 AND status NOT IN ('cancelado', 'finalizado') AND data_hora < $4 AND data_hora_fim > $3`,
            [profId, id, data_hora, novoFim]
        );

        if (conflito.length) {
            return res.status(409).json({ error: 'Conflito de horário', detail: 'Profissional já possui atendimento neste horário' });
        }

        const { rows } = await database.query(
            `UPDATE agendamentos SET data_hora = $1, data_hora_fim = $2, updated_at = NOW() WHERE id = $3 AND clinica_id = $4 RETURNING *`,
            [data_hora, novoFim, id, clinica_id]
        );
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao reagendar' });
    }
};

/**
 * PATCH /agendamentos/:id/progresso
 */
const atualizarProgresso = async (req, res) => {
    const { clinica_id, cargo, id: userId } = req.user;
    const { id } = req.params;
    const { progress } = req.body;

    try {
        const { rows: check } = await database.query(
            'SELECT profissional_id FROM agendamentos WHERE id = $1 AND  clinica_id = $2',
            [id, clinica_id]
        );
        if (!check.length) return res.status(404).json({ error: 'Não encontrado' });

        if (['dentista', 'esteticista'].includes(cargo)) {
            if (check[0].profissional_id !== userId) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
        }

        const { rows } = await database.query(
            `UPDATE agendamentos SET procedure_progress =$1, updated_at = NOW()
            WHERE id = $2 AND clinica_id = $3 RETURNING *`,
            [progress, id, clinica_id]
        );
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar progresso' });
    }
};

module.exports = {
    listarAgendamentos, getAgendamento, criarAgendamento, atualizarStatus, atualizarData, atualizarProgresso 
};