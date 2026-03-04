require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes         = require('./modules/auth/auth.routes');
const usuariosRoutes     = require('./modules/usuarios/usuarios.routes');
const agendamentosRoutes = require('./modules/agendamentos/agendamentos.routes');
const pacientesRoutes    = require('./modules/pacientes/pacientes.routes');
const clinicasRoutes     = require('./modules/clinicas/clinicas.routes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(rateLimit({ windowMs: 15 * 60_000, max: 200 }));
app.use(express.json());

app.use('/auth',         authRoutes);
app.use('/usuarios',     usuariosRoutes);
app.use('/agendamentos', agendamentosRoutes);
app.use('/pacientes',    pacientesRoutes);
app.use('/clinicas',     clinicasRoutes);

app.get('/health', (_, res) => res.json({ ok: true, ts: new Date() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('🚀 Servidor iniciado!');
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log('⏰', new Date().toLocaleString('pt-BR'));
});

module.exports = app;