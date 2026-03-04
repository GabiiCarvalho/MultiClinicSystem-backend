const bcrypt   = require('bcrypt');
const database = require('../../config/database');

/**
 * POST /clinicas/register
 * Cadastro público de nova clínica
 * Body: { nome, cnpj, email, senha, telefone?, endereco?, nomeGestor }
 */
const registrarClinica = async (req, res) => {
  const { nome, cnpj, email, senha, telefone, endereco, nomeGestor } = req.body;

  if (!nome || !cnpj || !email || !senha || !nomeGestor) {
    return res.status(400).json({
      error: 'Nome da clínica, CNPJ, e-mail, senha e nome do gestor são obrigatórios',
    });
  }

  const cnpjLimpo = cnpj.replace(/\D/g, '');
  if (cnpjLimpo.length !== 14) {
    return res.status(400).json({ error: 'CNPJ inválido — informe 14 dígitos' });
  }

  try {
    // Verifica duplicata de e-mail ou CNPJ
    const { rows: existe } = await database.query(
      'SELECT id FROM clinicas WHERE email = $1 OR cnpj = $2',
      [email.toLowerCase(), cnpjLimpo]
    );

    if (existe.length) {
      return res.status(409).json({ error: 'E-mail ou CNPJ já cadastrado' });
    }

    const senha_hash = await bcrypt.hash(senha, 12);

    // Cria a clínica
    const { rows: clinicaRows } = await database.query(
      `INSERT INTO clinicas (nome, cnpj, email, senha_hash, telefone, endereco)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nome, email, cnpj, telefone, endereco`,
      [nome, cnpjLimpo, email.toLowerCase(), senha_hash, telefone || null, endereco || null]
    );
    const clinica = clinicaRows[0];

    // Cria o usuário proprietário vinculado à clínica
    await database.query(
      `INSERT INTO usuarios (clinica_id, nome, email, senha_hash, cargo)
       VALUES ($1, $2, $3, $4, 'proprietario')`,
      [clinica.id, nomeGestor, email.toLowerCase(), senha_hash]
    );

    res.status(201).json({
      message: 'Clínica cadastrada com sucesso! Faça login para continuar.',
      clinica_id: clinica.id,
      nome:       clinica.nome,
    });
  } catch (error) {
    console.error('Erro ao registrar clínica:', error);
    res.status(500).json({ error: 'Erro ao cadastrar clínica' });
  }
};

/**
 * GET /clinicas/me
 * Dados da clínica logada
 */
const getClinica = async (req, res) => {
  const { clinica_id } = req.user;
  try {
    const { rows } = await database.query(
      'SELECT id, nome, email, cnpj, telefone, endereco, ativo, created_at FROM clinicas WHERE id = $1',
      [clinica_id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Clínica não encontrada' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clínica' });
  }
};

/**
 * PATCH /clinicas/me
 * Atualizar dados da clínica (somente proprietário/gestor)
 */
const atualizarClinica = async (req, res) => {
  const { clinica_id, cargo } = req.user;

  if (!['proprietario', 'gestor'].includes(cargo)) {
    return res.status(403).json({ error: 'Apenas proprietário ou gestor pode alterar dados da clínica' });
  }

  const { nome, telefone, endereco } = req.body;

  try {
    const updates = [];
    const values  = [];
    let p = 1;

    if (nome)     { updates.push(`nome = $${p++}`);     values.push(nome); }
    if (telefone) { updates.push(`telefone = $${p++}`); values.push(telefone); }
    if (endereco) { updates.push(`endereco = $${p++}`); values.push(endereco); }

    if (!updates.length) return res.status(400).json({ error: 'Nada para atualizar' });

    values.push(clinica_id);
    const { rows } = await database.query(
      `UPDATE clinicas SET ${updates.join(', ')} WHERE id = $${p}
       RETURNING id, nome, email, cnpj, telefone, endereco`,
      values
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar clínica' });
  }
};

module.exports = { registrarClinica, getClinica, atualizarClinica };