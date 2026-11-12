-- 1. Adiciona rastreamento de consumo no estoque

ALTER TABLE materiais ADD COLUMN IF NOT EXISTS paciente_id INTEGER REFERENCES pacientes(id) ON DELETE SET NULL;
ALTER TABLE materiais ADD COLUMN IF NOT EXISTS agendamento_id INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL;

-- Tabela de movimentações (histórico de entradas/saídas)
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id              SERIAL PRIMARY KEY,
  clinica_id      INTEGER NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  material_id     INTEGER NOT NULL REFERENCES materiais(id) ON DELETE CASCADE,
  tipo            VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada','saida','ajuste')),
  quantidade      DECIMAL(10,3) NOT NULL,
  valor_unitario  DECIMAL(10,2),
  motivo          VARCHAR(200),
  paciente_id     INTEGER REFERENCES pacientes(id) ON DELETE SET NULL,
  agendamento_id  INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL,
  usuario_id      INTEGER NOT NULL REFERENCES usuarios(id),
  observacoes     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mov_estoque_clinica ON movimentacoes_estoque(clinica_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mov_estoque_paciente ON movimentacoes_estoque(paciente_id);
CREATE INDEX IF NOT EXISTS idx_mov_estoque_material ON movimentacoes_estoque(material_id);

-- ============================================================
-- 2. Adiciona FK de agendamento nas aplicações
-- ============================================================
ALTER TABLE aplicacoes_produtos ADD COLUMN IF NOT EXISTS quantidade_estoque_momento DECIMAL(10,3);

SELECT 'Migration 003 aplicada com sucesso!' AS resultado;