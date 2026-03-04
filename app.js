require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');

const authRoutes         = require('./modules/auth/auth.routes');
const usuariosRoutes     = require('./modules/usuarios/usuarios.routes');
const agendamentosRoutes = require('./modules/agendamentos/agendamentos.routes');
const pacientesRoutes    = require('./modules/pacientes/pacientes.routes');
const clinicasRoutes     = require('./modules/clinicas/clinicas.routes');

const app = express();

// Segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting — 200 req/15min por IP
app.use(rateLimit({ windowMs: 15 * 60_000, max: 200 }));

app.use(express.json());

// Rotas
app.use('/auth',         authRoutes);
app.use('/usuarios',     usuariosRoutes);
app.use('/agendamentos', agendamentosRoutes);
app.use('/pacientes',    pacientesRoutes);
app.use('/clinicas',     clinicasRoutes);

// Health check
app.get('/health', (_, res) => res.json({ ok: true, ts: new Date() }));

// Handler de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));

module.exports = app;