const bcrypt = require('bcrypt');
const database = require('../../config/database');

/**
 *  GET /usuarios
 *  Gestor/proprietário vê todos os usuários da SUA clínica
 */

const listarUsuarios = async (req, res) => {
    const { clinica_id } = req.user;
    try {
        const { rows } = await database.query(
            `SELECT id, nome, email, cargo, especialidade, ativo, created_at
            FROM usuarios
            WHERE clinica_id =$1
            ORDER BY cargo, nome`,
            [clinica_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
};

/**
 *  POST /usuarios
 *  Gestor cadastra novo membro da equipe
 */

const criarUsuario = async (req, res) => {
    const { clinica_id } = req.user;
    const { nome, email, senha, cargo, especialidade } = req.body;

    const cargosValidos = ['Gestor', 'dentista', 'esteticista', 'atendente', 'financeiro'];
    if (!cargosValidos.includes(cargo)) {
        return res.status(400).json({ error: 'Cargo inválido', cargosValidos });
    }

    try {
        // Verifica se email já existe
        const { rows: exists } = await database.query(
            'SELECT id FROM usuarios WHERE email = $1', [email.toLowerCase()]
        );
        if (exists.length) {
            return res.status(409).json({ error: 'E-mail já cadastrado' });
        }

        const senha_hash = await bcrypt.hash(senha, 12); 
        const { rows } = await database.query(
            `INSERT INTO usuarios (clinica_id, nome, email, senha_hash, cargo, especialidade)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, nome, email, cargo, especialidade, ativo`,
            [clinica_id, nome, email.toLowerCase(), senha_hash, cargo, especialidade || null]
        );
        
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
};

/**
 *  PATCH /usuarios/:id
 *  Atualizar dados (gestor pode alterar qualquer um da clínica)
 */

const atualizarUsuario = async (req, res) => {
    const { clinica_id } = req.user;
    const { id } = req.params;
    const { nome, cargo, especialidade, ativo, senha } = req.body;

    try {
        // Garante que pertence à mesma clínica
        const { rows: check } = await database.query(
            'SELECT id FROM usuarios WHERE id = $1 AND clinica_id = $2', [id, clinica_id]
        );
        if (!check.length) return res.status(404).json({ error: 'Usuário não encontrado' });

        const updates = [];
        const values = [];
        let paramIdx = 1;

        if (nome) { updates.push(`nome = $${paramIdx++}`); values.push(nome); }
        if (cargo) { updates.push(`cargo = $${paramIdx++}`); values.push(cargo); }
        if (especialidade !== undefined) { updates.push(`especialidade = $${paramIdx++}`); values.push(especialidade); }
        if (ativo !== undefined) { updates.push(`ativo = $${paramIdx++}`); values.push(ativo); }
        if (senha) {
            const hash = await bcrypt.hash(senha,12);
            updates.push(`senha_hash = $${paramIdx++}`); values.push(hash);
        }

        if (!updates.length) return res.status(400).json({ error: 'Nenhum campo para atualizar' });

        values.push(id);
        const { rows } = await database.query(
            `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${paramIdx}
            RETURNING id, nome, email, cargo, especialidade, ativo`,
            values
        );

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
};

/**
 *  DELETE /usuarios/:id
 *  Desativa (soft delete) - nunca apaga por histórico
 */

const desativarUsuario = async (req, res) => {
    const { clinica_id } = req.user;
    const { id } = req.params;

    try {
        await database.query(
            'UPDATE usuarios SET ativo = false WHERE id = $1 AND clinica_id = $2',
            [id, clinica_id]
        );
        res.json({ message: 'Usuário desativado' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao desativar usuário' });
    }
};

module.exports = { listarUsuarios, criarUsuario, atualizarUsuario, desativarUsuario };