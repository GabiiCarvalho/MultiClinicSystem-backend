require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./modules/auth/auth.routes");
const usuariosRoutes = require("./modules/usuarios/usuarios.routes");
const agendamentosRoutes = require("./modules/agendamentos/agendamentos.routes");
const pacientesRoutes = require("./modules/pacientes/pacientes.routes");
const clinicasRoutes = require("./modules/clinicas/clinicas.routes");
const procedimentosRoutes = require("./modules/procedimentos/procedimentos.routes");
const pagamentosRoutes = require("./modules/pagamentos/pagamentos.routes");
const materiaisRoutes = require("./modules/materiais/materiais.routes");
const assinaturasRoutes = require("./modules/assinaturas/assinaturas.routes");
const mercadopagoRoutes = require("./modules/mercadopago/mercadopago.routes");

// Prontuário
const odontogramasRoutes = require("./modules/odontogramas/odontogramas.routes");
const fotosRoutes = require("./modules/fotos/fotos.routes");
const pacotesRoutes = require("./modules/pacotes/pacotes.routes");
const evolucoesRoutes = require("./modules/evolucoes/evolucoes.routes");

// ✅ Conformidade Estética (ANVISA + LGPD + Receita Diferida)
const produtosEsteticaRoutes = require("./modules/produtos_estetica/produtos_estetica.routes");
const lotesProdutoRoutes = require("./modules/lotes_produto/lotes_produto.routes");
const aplicacoesRoutes = require("./modules/aplicacoes/aplicacoes.routes");
const consentimentosImagemRoutes = require("./modules/consentimentos_imagem/consentimentos_imagem.routes");
const receitaDiferidaRoutes = require("./modules/receita_diferida/receita_diferida.routes");

const app = express();
const isDev = process.env.NODE_ENV !== "production";

app.use(
  helmet({
    contentSecurityPolicy: isDev ? false : undefined,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  }),
);

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:5174"
)
  .split(",")
  .map((s) => s.trim());

const corsOptions = {
  origin: (origin, callback) => {
    if (isDev || !origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /\.multiclinic\.app$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Clinica-Id"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 5000 : 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Muitas requisições. Tente novamente em alguns minutos.",
    },
  }),
);

app.use(express.json({ limit: "1mb" }));

// ─────────────────────────────────────────────────────────────
// ROTAS
// ─────────────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/agendamentos", agendamentosRoutes);
app.use("/pacientes", pacientesRoutes);
app.use("/clinicas", clinicasRoutes);
app.use("/procedimentos", procedimentosRoutes);
app.use("/pagamentos", pagamentosRoutes);
app.use("/materiais", materiaisRoutes);
app.use("/assinaturas", assinaturasRoutes);
app.use("/mercadopago", mercadopagoRoutes);

// Prontuário
app.use("/odontogramas", odontogramasRoutes);
app.use("/fotos", fotosRoutes);
app.use("/pacotes", pacotesRoutes);
app.use("/evolucoes", evolucoesRoutes);

// ✅ Conformidade Estética
app.use("/produtos-estetica", produtosEsteticaRoutes);
app.use("/lotes-produto", lotesProdutoRoutes);
app.use("/aplicacoes", aplicacoesRoutes);
app.use("/consentimentos-imagem", consentimentosImagemRoutes);
app.use("/receita-diferida", receitaDiferidaRoutes);

app.get("/health", (_, res) => res.json({ ok: true, ts: new Date() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Servidor iniciado!");
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🌐 Acessível na rede local (para o celular)`);
  console.log("⏰", new Date().toLocaleString("pt-BR"));
});

module.exports = app;
