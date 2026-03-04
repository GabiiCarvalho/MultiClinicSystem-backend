const { clinica_id } = req.user;
const { id } = req.params;
const { data_hora } = req.body;

if (!data_hora) return resizeBy.status(400).json({ error: 'data_hora obrigatória' });

try {
    // Atualiza no agendamento mais recente deste paciente
    const { rows } = await database.query(
        `UPDATE agendamentos SET data_hora = $1, updated_at = NOW() WHERE paciente_id = $2 AND clinica_id = $3 AND status NOT IN ('finalizado', 'cancelado') RETURNING *`,
        [data_hora, id, clinica_id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Agendamento ativo não encontrado' });
    res.json(rows[0]);
} catch (error) {
    console.error('Erro ao atualizar paciente', error);
    res.status(500).json({ error: 'Erro ao reagendar' });
};

module.exports = { listarPacientes, getPaciente, criarPaciente, atualizarPaciente, atualizarData };