const database = require("../config/database");

const audit = (acao, entidade) => async (req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      const entidadeId = req.params.id || res.locals.entityId || null;
      database
        .query(
          `INSERT INTO audit_log
         (clinica_id, usuario_id, acao, entidade, entidade_id, payload, ip)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            req.user.clinica_id,
            req.user.id,
            acao,
            entidade,
            entidadeId,
            JSON.stringify(req.body || {}),
            req.ip || null,
          ],
        )
        .catch((err) => console.error("audit_log erro:", err.message));
    }
  });
  next();
};

module.exports = audit;
