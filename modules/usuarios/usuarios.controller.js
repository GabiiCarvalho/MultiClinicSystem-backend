const bcrypt = require("bcrypt");
const database = require("../../config/database");

const CARGOS_VALIDOS = [
  "gestor",
  "proprietario",
  "dentista",
  "esteticista",
  "atendente",
  "financeiro",
];

/**
 * GET /usuarios
 */
const listarUsuarios = async (req, res) => {
  try {
    const { rows } = await database.query(
      `SELECT id, nome, email, cargo, especialidade, ativo, created_at
       FROM usuarios WHERE clinica_id = $1
       ORDER BY cargo, nome`,
      [req.user.clinica_id],
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
};

/**
 * POST /usuarios
 */
const criarUsuario = async (req, res) => {
  const { clinica_id } = req.user;
  const { nome, email, senha, cargo, especialidade } = req.body;

  // 1. Validações básicas
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Nome, e-mail e senha obrigatórios" });
  }
  if (senha.length < 6) {
    return res
      .status(400)
      .json({ error: "Senha deve ter no mínimo 6 caracteres" });
  }

  const cargoNorm = String(cargo || "")
    .toLowerCase()
    .trim();
  if (!CARGOS_VALIDOS.includes(cargoNorm)) {
    return res
      .status(400)
      .json({ error: "Cargo inválido", cargosValidos: CARGOS_VALIDOS });
  }

  try {
    // 2. Verifica se o e-mail já existe (em qualquer clínica)
    const { rows: exists } = await database.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email.toLowerCase().trim()],
    );
    if (exists.length) {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }

    // 3. Verifica o limite do plano (contando APENAS profissionais, não o gestor)
    const { rows: clinicaInfo } = await database.query(
      "SELECT plano, limite_profissionais FROM clinicas WHERE id = $1",
      [clinica_id],
    );

    const { rows: qtdAtual } = await database.query(
      `SELECT COUNT(*) FROM usuarios 
       WHERE clinica_id = $1 AND ativo = true AND cargo NOT IN ('gestor', 'proprietario')`,
      [clinica_id],
    );

    const limite = clinicaInfo[0]?.limite_profissionais || 3; // Padrão 3 se não definido
    if (Number(qtdAtual[0].count) >= limite) {
      return res.status(403).json({
        error: `Limite do plano atingido. Seu plano permite até ${limite} profissionais ativos. Para adicionar mais, faça upgrade.`,
      });
    }

    // 4. Cria o usuário
    const senha_hash = await bcrypt.hash(senha, 12);
    const { rows } = await database.query(
      `INSERT INTO usuarios (clinica_id, nome, email, senha_hash, cargo, especialidade)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nome, email, cargo, especialidade, ativo`,
      [
        clinica_id,
        nome,
        email.toLowerCase().trim(),
        senha_hash,
        cargoNorm,
        especialidade || null,
      ],
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
};

/**
 * PATCH /usuarios/:id
 */
const atualizarUsuario = async (req, res) => {
  const { clinica_id } = req.user;
  const { id } = req.params;
  const { nome, cargo, especialidade, ativo, senha } = req.body;

  try {
    const { rows: check } = await database.query(
      "SELECT id, cargo FROM usuarios WHERE id = $1 AND clinica_id = $2",
      [id, clinica_id],
    );
    if (!check.length)
      return res.status(404).json({ error: "Usuário não encontrado" });

    const updates = [];
    const values = [];
    let p = 1;

    if (nome) {
      updates.push(`nome = $${p++}`);
      values.push(nome);
    }

    if (cargo !== undefined) {
      const cargoNorm = String(cargo).toLowerCase().trim();
      if (!CARGOS_VALIDOS.includes(cargoNorm)) {
        return res
          .status(400)
          .json({ error: "Cargo inválido", cargosValidos: CARGOS_VALIDOS });
      }
      // Não permite rebaixar o último proprietário
      if (check[0].cargo === "proprietario" && cargoNorm !== "proprietario") {
        const { rows: owners } = await database.query(
          `SELECT COUNT(*) FROM usuarios
           WHERE clinica_id = $1 AND cargo = 'proprietario' AND ativo = true AND id != $2`,
          [clinica_id, id],
        );
        if (Number(owners[0].count) === 0) {
          return res
            .status(400)
            .json({
              error: "Não é possível rebaixar o único proprietário ativo",
            });
        }
      }
      updates.push(`cargo = $${p++}`);
      values.push(cargoNorm);
    }

    if (especialidade !== undefined) {
      updates.push(`especialidade = $${p++}`);
      values.push(especialidade || null);
    }

    if (ativo !== undefined) {
      // Não permite desativar o último proprietário ativo
      if (!ativo && check[0].cargo === "proprietario") {
        const { rows: owners } = await database.query(
          `SELECT COUNT(*) FROM usuarios
           WHERE clinica_id = $1 AND cargo = 'proprietario' AND ativo = true AND id != $2`,
          [clinica_id, id],
        );
        if (Number(owners[0].count) === 0) {
          return res
            .status(400)
            .json({
              error: "Não é possível desativar o único proprietário ativo",
            });
        }
      }
      updates.push(`ativo = $${p++}`);
      values.push(ativo);
    }

    if (senha) {
      if (senha.length < 6)
        return res
          .status(400)
          .json({ error: "Senha deve ter no mínimo 6 caracteres" });
      const hash = await bcrypt.hash(senha, 12);
      updates.push(`senha_hash = $${p++}`);
      values.push(hash);
    }

    if (!updates.length)
      return res.status(400).json({ error: "Nenhum campo para atualizar" });

    values.push(id, clinica_id);
    const { rows } = await database.query(
      `UPDATE usuarios SET ${updates.join(", ")}
       WHERE id = $${p++} AND clinica_id = $${p}
       RETURNING id, nome, email, cargo, especialidade, ativo`,
      values,
    );
    res.json(rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
};

/**
 * DELETE /usuarios/:id (Soft Delete)
 */
const desativarUsuario = async (req, res) => {
  const { clinica_id, id: requesterId } = req.user;
  const { id } = req.params;

  if (Number(id) === Number(requesterId)) {
    return res
      .status(400)
      .json({ error: "Você não pode desativar sua própria conta" });
  }

  try {
    const { rows: alvo } = await database.query(
      "SELECT cargo, ativo FROM usuarios WHERE id = $1 AND clinica_id = $2",
      [id, clinica_id],
    );
    if (!alvo.length)
      return res.status(404).json({ error: "Usuário não encontrado" });

    if (alvo[0].cargo === "proprietario" && alvo[0].ativo) {
      const { rows: owners } = await database.query(
        `SELECT COUNT(*) FROM usuarios
         WHERE clinica_id = $1 AND cargo = 'proprietario' AND ativo = true AND id != $2`,
        [clinica_id, id],
      );
      if (Number(owners[0].count) === 0) {
        return res
          .status(400)
          .json({
            error: "Não é possível desativar o único proprietário ativo",
          });
      }
    }

    await database.query(
      "UPDATE usuarios SET ativo = false WHERE id = $1 AND clinica_id = $2",
      [id, clinica_id],
    );
    res.json({ message: "Usuário desativado" });
  } catch (error) {
    console.error("Erro ao desativar usuário:", error);
    res.status(500).json({ error: "Erro ao desativar usuário" });
  }
};

module.exports = {
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  desativarUsuario,
};
