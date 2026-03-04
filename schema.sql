-- ============================================================
-- SCHEMA MultiClinic — PostgreSQL
-- ============================================================

-- Clínicas (tenant raiz — isolamento total)
CREATE TABLE clinicas (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(200) NOT NULL,
  cnpj        VARCHAR(18)  NOT NULL UNIQUE,
  email       VARCHAR(200) NOT NULL UNIQUE,
  senha_hash  TEXT         NOT NULL,
  telefone    VARCHAR(20),
  endereco    TEXT,
  ativo       BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Usuários da clínica (dentistas, atendentes, etc.)
CREATE TABLE usuarios (
  id          SERIAL PRIMARY KEY,
  clinica_id  INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome        VARCHAR(200) NOT NULL,
  email       VARCHAR(200) NOT NULL UNIQUE,
  senha_hash  TEXT         NOT NULL,
  cargo       VARCHAR(50)  NOT NULL
              CHECK (cargo IN ('gestor','proprietario','dentista',
                               'esteticista','atendente','financeiro')),
  especialidade VARCHAR(100),  -- ex: "Ortodontia", "Estética Facial"
  ativo       BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Pacientes (pertencem à clínica)
CREATE TABLE pacientes (
  id          SERIAL PRIMARY KEY,
  clinica_id  INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome        VARCHAR(200) NOT NULL,
  telefone    VARCHAR(20),
  email       VARCHAR(200),
  cpf         VARCHAR(14),
  data_nascimento DATE,
  observacoes TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Procedimentos (catálogo da clínica)
CREATE TABLE procedimentos (
  id          SERIAL PRIMARY KEY,
  clinica_id  INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome        VARCHAR(200) NOT NULL,
  descricao   TEXT,
  valor       DECIMAL(10,2) DEFAULT 0,
  duracao_min INTEGER DEFAULT 60,
  tipo        VARCHAR(50) CHECK (tipo IN ('odontologia','estetica','outro'))
);

-- Agendamentos (coração do sistema)
CREATE TABLE agendamentos (
  id               SERIAL PRIMARY KEY,
  clinica_id       INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id      INTEGER NOT NULL REFERENCES pacientes(id),
  profissional_id  INTEGER NOT NULL REFERENCES usuarios(id),
  procedimento_id  INTEGER REFERENCES procedimentos(id),
  data_hora        TIMESTAMP NOT NULL,
  data_hora_fim    TIMESTAMP,
  status           VARCHAR(30) NOT NULL DEFAULT 'agendado'
                   CHECK (status IN ('agendado','confirmado','em_procedimento',
                                     'finalizado','cancelado')),
  valor            DECIMAL(10,2),
  pago             BOOLEAN DEFAULT false,
  motivo_cancelamento TEXT,
  observacoes      TEXT,
  procedure_progress INTEGER DEFAULT 0,
  criado_por       INTEGER REFERENCES usuarios(id),
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- Índices de performance
CREATE INDEX idx_agendamentos_clinica    ON agendamentos(clinica_id);
CREATE INDEX idx_agendamentos_profissional ON agendamentos(profissional_id);
CREATE INDEX idx_agendamentos_data       ON agendamentos(data_hora);
CREATE INDEX idx_agendamentos_status     ON agendamentos(status);
CREATE INDEX idx_usuarios_clinica        ON usuarios(clinica_id);
CREATE INDEX idx_pacientes_clinica       ON pacientes(clinica_id);
