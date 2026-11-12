const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const auth = require("../../middleware/auth");
const {
  loginClinica,
  loginUsuario,
  getMe,
  logoutUser,
} = require("./auth.controller");
const {
  solicitarRecuperacao,
  redefinirSenha,
} = require("./password-reset.controller");

/* ─── Rate limiters ──────────────────────────────────────────── */

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 10 : 200,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente em 15 minutos." },
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 5 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas solicitações de recuperação. Aguarde 15 minutos." },
});

/* ─── Rotas públicas ─────────────────────────────────────────── */

router.post("/clinica/login", loginLimiter, loginClinica);
router.post("/login", loginLimiter, loginUsuario);

router.post("/forgot-password", resetLimiter, solicitarRecuperacao);
router.post("/reset-password", resetLimiter, redefinirSenha);

router.post("/logout", logoutUser);

/* ─── Rotas protegidas ───────────────────────────────────────── */

router.get("/me", auth, getMe);

module.exports = router;
