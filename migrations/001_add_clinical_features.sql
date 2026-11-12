-- ============================================================
-- 1. ODONTOGRAMA (essencial para odontologia)
-- ============================================================
CREATE TABLE odontogramas (
  id               SERIAL PRIMARY KEY,
  clinica_id       INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id      INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profissional_id  INTEGER NOT NULL REFERENCES usuarios(id),
  agendamento_id   INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL,
  dentes           JSONB NOT NULL DEFAULT '{}'::jsonb,
  observacoes      TEXT,
  versao           INTEGER DEFAULT 1,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_odontogramas_clinica  ON odontogramas(clinica_id);
CREATE INDEX idx_odontogramas_paciente ON odontogramas(paciente_id);
CREATE INDEX idx_odontogramas_data     ON odontogramas(paciente_id, created_at DESC);

-- ============================================================
-- 2. FOTOS DO PACIENTE (essencial para estética)
-- ============================================================
CREATE TABLE fotos_paciente (
  id               SERIAL PRIMARY KEY,
  clinica_id       INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id      INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  agendamento_id   INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL,
  profissional_id  INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo             VARCHAR(30) NOT NULL
                   CHECK (tipo IN ('antes', 'depois', 'evolucao', 'documentacao')),
  categoria        VARCHAR(50),
  url              TEXT NOT NULL,
  storage_key      TEXT,
  descricao        TEXT,
  data_captura     TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fotos_paciente    ON fotos_paciente(paciente_id, tipo);
CREATE INDEX idx_fotos_clinica     ON fotos_paciente(clinica_id);
CREATE INDEX idx_fotos_agendamento ON fotos_paciente(agendamento_id);

-- ============================================================
-- 3. TERMO DE CONSENTIMENTO DIGITAL (LGPD)
-- ============================================================
CREATE TABLE termos_consentimento (
  id                SERIAL PRIMARY KEY,
  clinica_id        INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id       INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  agendamento_id    INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL,
  procedimento_id   INTEGER REFERENCES procedimentos(id) ON DELETE SET NULL,
  template_versao   VARCHAR(20) NOT NULL,
  conteudo_hash     TEXT NOT NULL,
  conteudo_snapshot TEXT NOT NULL,
  assinatura_base64 TEXT,
  ip_assinatura     VARCHAR(45),
  user_agent        TEXT,
  aceito_em         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tcle_paciente    ON termos_consentimento(paciente_id);
CREATE INDEX idx_tcle_clinica     ON termos_consentimento(clinica_id);
CREATE INDEX idx_tcle_agendamento ON termos_consentimento(agendamento_id);

-- ============================================================
-- 4. PACOTES DE SESSÕES (estética)
-- ============================================================
CREATE TABLE pacotes_paciente (
  id              SERIAL PRIMARY KEY,
  clinica_id      INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id     INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  procedimento_id INTEGER NOT NULL REFERENCES procedimentos(id),
  nome            VARCHAR(200),
  total_sessoes   INTEGER NOT NULL,
  sessoes_usadas  INTEGER DEFAULT 0,
  valor_total     DECIMAL(10,2) NOT NULL DEFAULT 0,
  data_compra     TIMESTAMPTZ DEFAULT NOW(),
  validade        DATE,
  status          VARCHAR(20) NOT NULL DEFAULT 'ativo'
                  CHECK (status IN ('ativo', 'esgotado', 'expirado', 'cancelado')),
  observacoes     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pacotes_paciente ON pacotes_paciente(paciente_id, status);
CREATE INDEX idx_pacotes_clinica  ON pacotes_paciente(clinica_id);

CREATE TABLE sessoes_utilizadas (
  id             SERIAL PRIMARY KEY,
  pacote_id      INTEGER NOT NULL REFERENCES pacotes_paciente(id) ON DELETE CASCADE,
  agendamento_id INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL,
  utilizada_em   TIMESTAMPTZ DEFAULT NOW(),
  observacoes    TEXT
);

CREATE INDEX idx_sessoes_pacote ON sessoes_utilizadas(pacote_id);

-- ============================================================
-- 5. EVOLUÇÕES CLÍNICAS (prontuário)
-- ============================================================
CREATE TABLE evolucoes (
  id                      SERIAL PRIMARY KEY,
  clinica_id              INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id             INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  agendamento_id          INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL,
  profissional_id         INTEGER NOT NULL REFERENCES usuarios(id),
  descricao               TEXT NOT NULL,
  procedimentos_realizados JSONB DEFAULT '[]'::jsonb,
  anexos                  JSONB DEFAULT '[]'::jsonb,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evolucoes_paciente ON evolucoes(paciente_id, created_at DESC);
CREATE INDEX idx_evolucoes_clinica  ON evolucoes(clinica_id);

-- ============================================================
-- 6. MÚLTIPLAS UNIDADES (filiais)
-- ============================================================
CREATE TABLE unidades (
  id          SERIAL PRIMARY KEY,
  clinica_id  INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome        VARCHAR(200) NOT NULL,
  cnpj        VARCHAR(18),
  endereco    TEXT,
  telefone    VARCHAR(20),
  ativo       BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_unidades_clinica ON unidades(clinica_id);

-- Adiciona unidade_id nas tabelas que escalam por filial
ALTER TABLE agendamentos ADD COLUMN unidade_id INTEGER REFERENCES unidades(id) ON DELETE SET NULL;
ALTER TABLE pagamentos   ADD COLUMN unidade_id INTEGER REFERENCES unidades(id) ON DELETE SET NULL;
ALTER TABLE materiais    ADD COLUMN unidade_id INTEGER REFERENCES unidades(id) ON DELETE SET NULL;
ALTER TABLE usuarios     ADD COLUMN unidade_id INTEGER REFERENCES unidades(id) ON DELETE SET NULL;

-- ============================================================
-- 7. COMISSÕES
-- ============================================================
CREATE TABLE comissoes (
  id             SERIAL PRIMARY KEY,
  clinica_id     INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  usuario_id     INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  agendamento_id INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL,
  pagamento_id   INTEGER REFERENCES pagamentos(id) ON DELETE SET NULL,
  percentual     DECIMAL(5,2) NOT NULL DEFAULT 0,
  valor          DECIMAL(10,2) NOT NULL DEFAULT 0,
  status         VARCHAR(20) NOT NULL DEFAULT 'pendente'
                 CHECK (status IN ('pendente', 'pago', 'cancelado')),
  pago_em        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comissoes_usuario  ON comissoes(usuario_id, status);
CREATE INDEX idx_comissoes_clinica  ON comissoes(clinica_id, status);