-- ============================================================
-- 1. CLÍNICAS (tenant raiz — isolamento total)
-- ============================================================
CREATE TABLE clinicas (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(200) NOT NULL,
  cnpj        VARCHAR(18)  NOT NULL UNIQUE,
  email       VARCHAR(200) NOT NULL UNIQUE,
  telefone    VARCHAR(20),
  endereco    TEXT,
  ativo       BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. USUÁRIOS (colaboradores da clínica)
-- ============================================================
CREATE TABLE usuarios (
  id            SERIAL PRIMARY KEY,
  clinica_id    INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome          VARCHAR(200) NOT NULL,
  email         VARCHAR(200) NOT NULL UNIQUE,
  senha_hash    TEXT         NOT NULL,
  cargo         VARCHAR(50)  NOT NULL
                CHECK (cargo IN ('gestor', 'proprietario', 'dentista',
                                 'esteticista', 'atendente', 'financeiro')),
  especialidade VARCHAR(100),
  ativo         BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. PACIENTES
-- ============================================================
CREATE TABLE pacientes (
  id               SERIAL PRIMARY KEY,
  clinica_id       INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome             VARCHAR(200) NOT NULL,
  telefone         VARCHAR(20),
  email            VARCHAR(200),
  cpf              VARCHAR(14),
  data_nascimento  DATE,
  observacoes      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. PROCEDIMENTOS (catálogo POR CLÍNICA — nomes/valores livres)
-- ============================================================
CREATE TABLE procedimentos (
  id           SERIAL PRIMARY KEY,
  clinica_id   INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome         VARCHAR(200) NOT NULL,
  descricao    TEXT,
  valor        DECIMAL(10,2) DEFAULT 0,
  duracao_min  INTEGER DEFAULT 60,
  tipo         VARCHAR(50) CHECK (tipo IN ('odontologia', 'estetica', 'outro')),
  ativo        BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  -- Um nome de procedimento não pode se repetir na mesma clínica
  UNIQUE (clinica_id, nome)
);

-- ============================================================
-- 5. AGENDAMENTOS (coração do sistema)
-- ============================================================
CREATE TABLE agendamentos (
  id                   SERIAL PRIMARY KEY,
  clinica_id           INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id          INTEGER NOT NULL REFERENCES pacientes(id),
  profissional_id      INTEGER NOT NULL REFERENCES usuarios(id),
  procedimento_id      INTEGER REFERENCES procedimentos(id) ON DELETE SET NULL,
  data_hora            TIMESTAMPTZ NOT NULL,
  data_hora_fim        TIMESTAMPTZ,
  status               VARCHAR(30) NOT NULL DEFAULT 'agendado'
                       CHECK (status IN ('agendado', 'confirmado',
                                         'em_procedimento', 'finalizado',
                                         'cancelado')),
  valor                DECIMAL(10,2),
  pago                 BOOLEAN DEFAULT false,
  motivo_cancelamento  TEXT,
  observacoes          TEXT,
  procedure_progress   INTEGER DEFAULT 0,
  criado_por           INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),

  -- data_hora_fim deve ser maior que data_hora (se definida)
  CONSTRAINT chk_agendamento_datas
    CHECK (data_hora_fim IS NULL OR data_hora_fim > data_hora)
);

-- ============================================================
-- 6. PAGAMENTOS (faturamento real — substitui localStorage)
-- ============================================================
CREATE TABLE pagamentos (
  id               SERIAL PRIMARY KEY,
  clinica_id       INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id      INTEGER NOT NULL REFERENCES pacientes(id),
  agendamento_id   INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL,
  subtotal         DECIMAL(10,2) NOT NULL,
  desconto         DECIMAL(10,2) DEFAULT 0,
  total            DECIMAL(10,2) NOT NULL,
  forma_pagamento  VARCHAR(30) NOT NULL
                   CHECK (forma_pagamento IN ('dinheiro', 'pix',
                                              'cartao_credito', 'cartao_debito',
                                              'boleto', 'transferencia')),
  recebido         DECIMAL(10,2),
  troco            DECIMAL(10,2),
  criado_por       INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_pagamento_total CHECK (total >= 0),
  CONSTRAINT chk_pagamento_desconto CHECK (desconto >= 0)
);

-- ============================================================
-- 7. AUDITORIA (sem FK de propósito — preserva histórico)
-- ============================================================
CREATE TABLE audit_log (
  id           SERIAL PRIMARY KEY,
  clinica_id   INTEGER NOT NULL,
  usuario_id   INTEGER NOT NULL,
  acao         VARCHAR(100) NOT NULL,
  entidade     VARCHAR(50)  NOT NULL,
  entidade_id  INTEGER,
  payload      JSONB,
  ip           VARCHAR(45),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. RECUPERAÇÃO DE SENHA
-- ============================================================
CREATE TABLE password_reset_tokens (
  id          SERIAL PRIMARY KEY,
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. ÍNDICES DE PERFORMANCE
-- ============================================================

-- Clínicas
CREATE INDEX idx_clinicas_cnpj  ON clinicas(cnpj);
CREATE INDEX idx_clinicas_email ON clinicas(email);

-- Usuários
CREATE INDEX idx_usuarios_clinica    ON usuarios(clinica_id);
CREATE INDEX idx_usuarios_email      ON usuarios(email);
CREATE INDEX idx_usuarios_clinica_cargo ON usuarios(clinica_id, cargo);

-- Pacientes
CREATE INDEX idx_pacientes_clinica  ON pacientes(clinica_id);
CREATE INDEX idx_pacientes_nome     ON pacientes(clinica_id, nome);

-- Procedimentos
CREATE INDEX idx_procedimentos_clinica      ON procedimentos(clinica_id);
CREATE INDEX idx_procedimentos_clinica_ativo ON procedimentos(clinica_id, ativo);

-- Agendamentos
CREATE INDEX idx_agendamentos_clinica       ON agendamentos(clinica_id);
CREATE INDEX idx_agendamentos_profissional  ON agendamentos(profissional_id);
CREATE INDEX idx_agendamentos_paciente      ON agendamentos(paciente_id);
CREATE INDEX idx_agendamentos_data          ON agendamentos(data_hora);
CREATE INDEX idx_agendamentos_status        ON agendamentos(status);
CREATE INDEX idx_agendamentos_clinica_data  ON agendamentos(clinica_id, data_hora);
CREATE INDEX idx_agendamentos_prof_data     ON agendamentos(profissional_id, data_hora);
CREATE INDEX idx_agendamentos_pago          ON agendamentos(clinica_id, pago)
  WHERE pago = false;

-- Pagamentos
CREATE INDEX idx_pagamentos_clinica    ON pagamentos(clinica_id, created_at DESC);
CREATE INDEX idx_pagamentos_paciente   ON pagamentos(paciente_id);
CREATE INDEX idx_pagamentos_agendamento ON pagamentos(agendamento_id);

-- Auditoria
CREATE INDEX idx_audit_clinica        ON audit_log(clinica_id, created_at DESC);
CREATE INDEX idx_audit_usuario        ON audit_log(usuario_id, created_at DESC);
CREATE INDEX idx_audit_entidade       ON audit_log(entidade, entidade_id);

-- Reset tokens
CREATE INDEX idx_prt_usuario  ON password_reset_tokens(usuario_id);
CREATE INDEX idx_prt_expires  ON password_reset_tokens(expires_at);
CREATE INDEX idx_prt_hash     ON password_reset_tokens(token_hash);

-- ============================================================
-- 10. TRIGGER — atualiza `updated_at` automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agendamentos_updated_at
BEFORE UPDATE ON agendamentos
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 11. LIMPEZA AUTOMÁTICA DE TOKENS EXPIRADOS (opcional)
-- ============================================================
-- Rode periodicamente (ex: pg_cron) OU manualmente:
DELETE FROM password_reset_tokens
 WHERE expires_at < NOW() - INTERVAL '7 days';
--
-- Se tiver pg_cron habilitado:
 SELECT cron.schedule(
   'clean-reset-tokens',
   '0 3 * * *',  -- todo dia às 3h da manhã
   $$ DELETE FROM password_reset_tokens
      WHERE expires_at < NOW() - INTERVAL '7 days'; $$
 );

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================