-- ============================================================
-- 1. CATÁLOGO DE PRODUTOS (toxina, preenchedor, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS produtos_estetica (
  id              SERIAL PRIMARY KEY,
  clinica_id      INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  nome            VARCHAR(200) NOT NULL,
  fabricante      VARCHAR(200) NOT NULL,
  principio_ativo VARCHAR(200),
  registro_anvisa VARCHAR(100),
  tipo            VARCHAR(50) NOT NULL
                  CHECK (tipo IN ('toxina','preenchedor','bioestimulador','fio','peeling','outro')),
  ativo           BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_produtos_estetica_clinica ON produtos_estetica(clinica_id, ativo);

-- ============================================================
-- 2. LOTES DE PRODUTOS (rastreabilidade ANVISA)
-- ============================================================
CREATE TABLE IF NOT EXISTS lotes_produto (
  id              SERIAL PRIMARY KEY,
  clinica_id      INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  produto_id      INTEGER NOT NULL REFERENCES produtos_estetica(id) ON DELETE CASCADE,
  numero_lote     VARCHAR(100) NOT NULL,
  data_validade   DATE NOT NULL,
  quantidade_inicial INTEGER NOT NULL DEFAULT 1,
  quantidade_atual   INTEGER NOT NULL DEFAULT 1,
  fornecedor      VARCHAR(200),
  nota_fiscal     VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (clinica_id, produto_id, numero_lote)
);

CREATE INDEX IF NOT EXISTS idx_lotes_produto ON lotes_produto(clinica_id, produto_id);

-- ============================================================
-- 3. APLICAÇÕES (vínculo paciente ↔ lote)
-- ============================================================
CREATE TABLE IF NOT EXISTS aplicacoes_produtos (
  id              SERIAL PRIMARY KEY,
  clinica_id      INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id     INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  agendamento_id  INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL,
  evolucao_id     INTEGER REFERENCES evolucoes(id) ON DELETE SET NULL,
  lote_id         INTEGER NOT NULL REFERENCES lotes_produto(id),
  profissional_id INTEGER NOT NULL REFERENCES usuarios(id),
  quantidade      DECIMAL(10,3) NOT NULL DEFAULT 1,
  unidade         VARCHAR(20) NOT NULL DEFAULT 'un'
                  CHECK (unidade IN ('un','ml','ui','mg','g')),
  regiao_aplicada VARCHAR(200),
  observacoes     TEXT,
  aplicado_em     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aplicacoes_paciente   ON aplicacoes_produtos(paciente_id, aplicado_em DESC);
CREATE INDEX IF NOT EXISTS idx_aplicacoes_lote       ON aplicacoes_produtos(lote_id);
CREATE INDEX IF NOT EXISTS idx_aplicacoes_clinica    ON aplicacoes_produtos(clinica_id);

-- ============================================================
-- 4. CONSENTIMENTO DE IMAGEM (LGPD - separado do clínico)
-- ============================================================
CREATE TABLE IF NOT EXISTS consentimentos_imagem (
  id                    SERIAL PRIMARY KEY,
  clinica_id            INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id           INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  finalidade            VARCHAR(30) NOT NULL
                        CHECK (finalidade IN ('clinico','marketing','pesquisa','ambos')),
  autorizado            BOOLEAN NOT NULL DEFAULT false,
  assinatura_base64     TEXT,
  ip_assinatura         VARCHAR(45),
  user_agent            TEXT,
  versao_termo          VARCHAR(20) NOT NULL,
  conteudo_hash         TEXT NOT NULL,
  assinado_em           TIMESTAMPTZ DEFAULT NOW(),
  revogado_em           TIMESTAMPTZ,
  revogado_motivo       TEXT
);

CREATE INDEX IF NOT EXISTS idx_consent_paciente ON consentimentos_imagem(paciente_id, finalidade, autorizado);

-- Marca nas fotos se pode ser usada em marketing
ALTER TABLE fotos_paciente ADD COLUMN IF NOT EXISTS autorizado_marketing BOOLEAN DEFAULT false;

-- ============================================================
-- 5. RECEITA DIFERIDA (pacotes = obrigação até ser realizado)
-- ============================================================
-- Adiciona snapshot do valor unitário no momento da venda
ALTER TABLE pacotes_paciente ADD COLUMN IF NOT EXISTS valor_sessao_avulsa DECIMAL(10,2) DEFAULT 0;

-- Tabela de reconhecimento de receita (uma linha por sessão realizada)
CREATE TABLE IF NOT EXISTS receita_reconhecida (
  id              SERIAL PRIMARY KEY,
  clinica_id      INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  pacote_id       INTEGER NOT NULL REFERENCES pacotes_paciente(id) ON DELETE CASCADE,
  sessao_id       INTEGER REFERENCES sessoes_utilizadas(id) ON DELETE SET NULL,
  valor_reconhecido DECIMAL(10,2) NOT NULL,
  reconhecido_em  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receita_pacote   ON receita_reconhecida(pacote_id);
CREATE INDEX IF NOT EXISTS idx_receita_clinica  ON receita_reconhecida(clinica_id, reconhecido_em DESC);

-- ============================================================
-- 6. TRIGGER: ao debitar sessão, reconhecer receita
-- ============================================================
CREATE OR REPLACE FUNCTION reconhecer_receita_sessao()
RETURNS TRIGGER AS $$
DECLARE
  v_valor_avulso DECIMAL(10,2);
  v_clinica_id   INTEGER;
BEGIN
  SELECT COALESCE(p.valor_sessao_avulsa, 0), p.clinica_id
  INTO v_valor_avulso, v_clinica_id
  FROM pacotes_paciente p
  WHERE p.id = NEW.pacote_id;

  IF v_valor_avulso > 0 THEN
    INSERT INTO receita_reconhecida
      (clinica_id, pacote_id, sessao_id, valor_reconhecido)
    VALUES
      (v_clinica_id, NEW.pacote_id, NEW.id, v_valor_avulso);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reconhecer_receita ON sessoes_utilizadas;
CREATE TRIGGER trg_reconhecer_receita
AFTER INSERT ON sessoes_utilizadas
FOR EACH ROW EXECUTE FUNCTION reconhecer_receita_sessao();

SELECT 'Migration 002 (estética compliance) aplicada!' AS resultado;