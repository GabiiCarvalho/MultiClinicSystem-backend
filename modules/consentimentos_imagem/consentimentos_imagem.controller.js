const crypto = require("crypto");
const database = require("../../config/database");

const TEXTO_TERMO = {
  versao: "1.0",
  marketing: `Autorizo o uso das minhas imagens (fotos e vídeos) capturadas durante procedimentos realizados nesta clínica para fins de divulgação em redes sociais, site e materiais publicitários, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018). Estou ciente de que:
(1) posso revogar este consentimento a qualquer momento;
(2) as imagens clínicas permanecerão no meu prontuário independente desta autorização;
(3) não haverá identificação nominal nas publicações;
(4) as imagens poderão ser utilizadas por tempo indeterminado até revogação.`,
  clinico: `Autorizo o armazenamento e uso das minhas imagens para fins exclusivos de documentação clínica e acompanhamento do tratamento, conforme a LGPD (Lei 13.709/2018). As imagens serão acessadas apenas por profissionais da clínica e não serão divulgadas publicamente.`,
};

const getTermo = (finalidade) => {
  const texto =
    finalidade === "marketing" ? TEXTO_TERMO.marketing : TEXTO_TERMO.clinico;
  const hash = crypto.createHash("sha256").update(texto).digest("hex");
  return { versao: TEXTO_TERMO.versao, texto, hash };
};

const buscarAtual = async (req, res) => {
  const { clinica_id } = req.user;
  const { paciente_id } = req.params;
  try {
    const { rows } = await database.query(
      `SELECT * FROM consentimentos_imagem
       WHERE paciente_id = $1 AND clinica_id = $2 AND revogado_em IS NULL
       ORDER BY assinado_em DESC`,
      [paciente_id, clinica_id],
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao buscar consentimentos" });
  }
};

const obterTexto = (req, res) => {
  const finalidade =
    req.query.finalidade === "marketing" ? "marketing" : "clinico";
  res.json(getTermo(finalidade));
};

const assinar = async (req, res) => {
  const { clinica_id } = req.user;
  const {
    paciente_id,
    finalidade,
    autorizado,
    assinatura_base64,
    revogado_motivo,
  } = req.body;

  if (!paciente_id || !finalidade) {
    return res
      .status(400)
      .json({ error: "paciente_id e finalidade são obrigatórios" });
  }
  if (!["clinico", "marketing", "pesquisa", "ambos"].includes(finalidade)) {
    return res.status(400).json({ error: "Finalidade inválida" });
  }

  try {
    if (autorizado === false) {
      await database.query(
        `UPDATE consentimentos_imagem
         SET revogado_em = NOW(), revogado_motivo = $1
         WHERE paciente_id = $2 AND clinica_id = $3
           AND finalidade = $4 AND autorizado = true AND revogado_em IS NULL`,
        [
          revogado_motivo || "Revogado pelo titular",
          paciente_id,
          clinica_id,
          finalidade,
        ],
      );
      return res.json({ message: "Consentimento revogado" });
    }

    const termo = getTermo(finalidade);

    const { rows } = await database.query(
      `INSERT INTO consentimentos_imagem
       (clinica_id, paciente_id, finalidade, autorizado,
        assinatura_base64, ip_assinatura, user_agent, versao_termo, conteudo_hash)
       VALUES ($1,$2,$3,true,$4,$5,$6,$7,$8) RETURNING *`,
      [
        clinica_id,
        paciente_id,
        finalidade,
        assinatura_base64 || null,
        req.ip || null,
        req.headers["user-agent"] || null,
        termo.versao,
        termo.hash,
      ],
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao registrar consentimento" });
  }
};

module.exports = { buscarAtual, obterTexto, assinar };
