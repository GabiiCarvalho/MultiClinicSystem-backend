-- Tabela de Lojas (Clínicas)
CREATE TABLE lojas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(100),
    cnpj VARCHAR(18) UNIQUE,
    ativa BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários (funcionários da clínica)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cargo VARCHAR(50) NOT NULL CHECK (cargo IN ('proprietario', 'gestor', 'dentista', 'atendente', 'financeiro')),
    especialidade VARCHAR(100), -- Para dentistas
    cro VARCHAR(20) UNIQUE, -- Registro profissional (para dentistas)
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pacientes (renomeado de clientes)
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    endereco TEXT,
    convenio VARCHAR(100),
    numero_convenio VARCHAR(50),
    alergias TEXT,
    medicamentos_continuos TEXT,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias de Procedimentos
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(20) CHECK (tipo IN ('odontologico', 'estetico', 'cirurgico')) DEFAULT 'odontologico',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Procedimentos (renomeado de servicos)
CREATE TABLE procedimentos (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    duracao_minutos INTEGER NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('odontologico', 'estetico', 'cirurgico')) DEFAULT 'odontologico',
    ativo BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Materiais/Insumos
CREATE TABLE materiais (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    quantidade DECIMAL(10,2) NOT NULL DEFAULT 0,
    unidade VARCHAR(20) NOT NULL DEFAULT 'un',
    quantidade_minima DECIMAL(10,2) NOT NULL DEFAULT 10,
    preco_unitario DECIMAL(10,2) NOT NULL,
    fornecedor VARCHAR(100),
    categoria VARCHAR(20) CHECK (categoria IN ('consumivel', 'instrumental', 'medicamento')) DEFAULT 'consumivel',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Agendamentos
CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE SET NULL,
    dentista_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL, -- Quem criou o agendamento
    data_hora TIMESTAMP NOT NULL,
    data_hora_fim TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'nao_compareceu')) DEFAULT 'agendado',
    tipo_procedimento VARCHAR(100),
    observacoes TEXT,
    motivo_cancelamento TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itens de Agendamento (procedimentos agendados)
CREATE TABLE agendamento_itens (
    id SERIAL PRIMARY KEY,
    agendamento_id INTEGER REFERENCES agendamentos(id) ON DELETE CASCADE,
    procedimento_id INTEGER REFERENCES procedimentos(id) ON DELETE SET NULL,
    nome_procedimento VARCHAR(100) NOT NULL,
    descricao_procedimento TEXT,
    preco DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pendente', 'realizado', 'cancelado')) DEFAULT 'pendente',
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Orçamentos
CREATE TABLE orcamentos (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE SET NULL,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    validade DATE,
    subtotal DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('ativo', 'aprovado', 'expirado', 'cancelado')) DEFAULT 'ativo',
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itens de Orçamento
CREATE TABLE orcamento_itens (
    id SERIAL PRIMARY KEY,
    orcamento_id INTEGER REFERENCES orcamentos(id) ON DELETE CASCADE,
    procedimento_id INTEGER REFERENCES procedimentos(id) ON DELETE SET NULL,
    procedimento_nome VARCHAR(100) NOT NULL,
    procedimento_descricao TEXT,
    quantidade INTEGER NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Vendas
CREATE TABLE vendas (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    paciente_id INTEGER REFERENCES pacientes(id) ON DELETE SET NULL,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    agendamento_id INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(50) CHECK (forma_pagamento IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'convenio')) NOT NULL,
    parcelas INTEGER DEFAULT 1,
    status VARCHAR(20) CHECK (status IN ('pendente', 'pago', 'cancelado')) DEFAULT 'pago',
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itens de Venda
CREATE TABLE venda_itens (
    id SERIAL PRIMARY KEY,
    venda_id INTEGER REFERENCES vendas(id) ON DELETE CASCADE,
    procedimento_id INTEGER REFERENCES procedimentos(id) ON DELETE SET NULL,
    material_id INTEGER REFERENCES materiais(id) ON DELETE SET NULL,
    item_nome VARCHAR(100) NOT NULL,
    item_descricao TEXT,
    quantidade INTEGER NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Registro de Atividades (para auditoria)
CREATE TABLE registros_atividades (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    acao VARCHAR(100) NOT NULL,
    tabela_afetada VARCHAR(50),
    registro_id INTEGER,
    detalhes TEXT,
    ip_address VARCHAR(50),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Configurações do Sistema
CREATE TABLE configuracoes (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    chave VARCHAR(100) NOT NULL,
    valor TEXT,
    descricao TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(loja_id, chave)
);

-- Índices para otimização
CREATE INDEX idx_agendamentos_loja_data ON agendamentos(loja_id, data_hora);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_agendamentos_paciente ON agendamentos(paciente_id);
CREATE INDEX idx_agendamentos_dentista ON agendamentos(dentista_id);

CREATE INDEX idx_pacientes_telefone ON pacientes(telefone);
CREATE INDEX idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX idx_pacientes_loja ON pacientes(loja_id);

CREATE INDEX idx_vendas_loja_data ON vendas(loja_id, data_hora);
CREATE INDEX idx_vendas_paciente ON vendas(paciente_id);
CREATE INDEX idx_vendas_status ON vendas(status);

CREATE INDEX idx_procedimentos_loja ON procedimentos(loja_id);
CREATE INDEX idx_procedimentos_categoria ON procedimentos(categoria_id);
CREATE INDEX idx_procedimentos_tipo ON procedimentos(tipo);

CREATE INDEX idx_materiais_loja ON materiais(loja_id);
CREATE INDEX idx_materiais_quantidade ON materiais(quantidade);

CREATE INDEX idx_usuarios_loja ON usuarios(loja_id);
CREATE INDEX idx_usuarios_cargo ON usuarios(cargo);

CREATE INDEX idx_orcamentos_paciente ON orcamentos(paciente_id);
CREATE INDEX idx_orcamentos_status ON orcamentos(status);

-- Views úteis

-- View de agenda do dia
CREATE VIEW agenda_do_dia AS
SELECT 
    a.id,
    a.data_hora,
    a.data_hora_fim,
    a.status,
    p.nome AS paciente_nome,
    p.telefone AS paciente_telefone,
    u.nome AS dentista_nome,
    u.especialidade,
    STRING_AGG(ai.nome_procedimento, ', ') AS procedimentos
FROM agendamentos a
JOIN pacientes p ON a.paciente_id = p.id
JOIN usuarios u ON a.dentista_id = u.id
LEFT JOIN agendamento_itens ai ON a.id = ai.agendamento_id
WHERE DATE(a.data_hora) = CURRENT_DATE
GROUP BY a.id, p.nome, p.telefone, u.nome, u.especialidade
ORDER BY a.data_hora;

-- View de faturamento mensal
CREATE VIEW faturamento_mensal AS
SELECT 
    loja_id,
    DATE_TRUNC('month', data_hora) AS mes,
    COUNT(*) AS total_vendas,
    SUM(total) AS valor_total,
    AVG(total) AS ticket_medio,
    SUM(CASE WHEN forma_pagamento = 'dinheiro' THEN total ELSE 0 END) AS dinheiro,
    SUM(CASE WHEN forma_pagamento = 'cartao_credito' THEN total ELSE 0 END) AS cartao_credito,
    SUM(CASE WHEN forma_pagamento = 'cartao_debito' THEN total ELSE 0 END) AS cartao_debito,
    SUM(CASE WHEN forma_pagamento = 'pix' THEN total ELSE 0 END) AS pix,
    SUM(CASE WHEN forma_pagamento = 'convenio' THEN total ELSE 0 END) AS convenio
FROM vendas
WHERE status = 'pago'
GROUP BY loja_id, DATE_TRUNC('month', data_hora)
ORDER BY mes DESC;

-- View de estoque baixo
CREATE VIEW materiais_estoque_baixo AS
SELECT 
    id,
    nome,
    quantidade,
    unidade,
    quantidade_minima,
    preco_unitario,
    (quantidade_minima - quantidade) AS quantidade_faltante
FROM materiais
WHERE quantidade <= quantidade_minima
ORDER BY (quantidade_minima - quantidade) DESC;

-- View de procedimentos mais realizados
CREATE VIEW procedimentos_mais_realizados AS
SELECT 
    p.id,
    p.nome,
    p.tipo,
    c.nome AS categoria,
    COUNT(ai.id) AS total_realizacoes,
    SUM(ai.preco) AS valor_total
FROM procedimentos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN agendamento_itens ai ON p.id = ai.procedimento_id AND ai.status = 'realizado'
GROUP BY p.id, p.nome, p.tipo, c.nome
ORDER BY total_realizacoes DESC;

-- Função para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_data_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar data_atualizacao
CREATE TRIGGER trigger_update_lojas BEFORE UPDATE ON lojas FOR EACH ROW EXECUTE FUNCTION update_data_atualizacao();
CREATE TRIGGER trigger_update_usuarios BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_data_atualizacao();
CREATE TRIGGER trigger_update_pacientes BEFORE UPDATE ON pacientes FOR EACH ROW EXECUTE FUNCTION update_data_atualizacao();
CREATE TRIGGER trigger_update_categorias BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_data_atualizacao();
CREATE TRIGGER trigger_update_procedimentos BEFORE UPDATE ON procedimentos FOR EACH ROW EXECUTE FUNCTION update_data_atualizacao();
CREATE TRIGGER trigger_update_materiais BEFORE UPDATE ON materiais FOR EACH ROW EXECUTE FUNCTION update_data_atualizacao();
CREATE TRIGGER trigger_update_agendamentos BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION update_data_atualizacao();
CREATE TRIGGER trigger_update_agendamento_itens BEFORE UPDATE ON agendamento_itens FOR EACH ROW EXECUTE FUNCTION update_data_atualizacao();
CREATE TRIGGER trigger_update_orcamentos BEFORE UPDATE ON orcamentos FOR EACH ROW EXECUTE FUNCTION update_data_atualizacao();
CREATE TRIGGER trigger_update_vendas BEFORE UPDATE ON vendas FOR EACH ROW EXECUTE FUNCTION update_data_atualizacao();
CREATE TRIGGER trigger_update_configuracoes BEFORE UPDATE ON configuracoes FOR EACH ROW EXECUTE FUNCTION update_data_atualizacao();

-- Inserir dados iniciais para categorias padrão
INSERT INTO categorias (loja_id, nome, descricao, tipo) VALUES 
(1, 'Odontologia Geral', 'Procedimentos odontológicos gerais', 'odontologico'),
(1, 'Estética Facial', 'Procedimentos estéticos faciais', 'estetico'),
(1, 'Cirurgias', 'Procedimentos cirúrgicos', 'cirurgico');

-- Inserir procedimentos iniciais
INSERT INTO procedimentos (loja_id, categoria_id, nome, descricao, preco, duracao_minutos, tipo) VALUES 
(1, 1, 'Consulta Odontológica', 'Avaliação inicial com dentista', 150.00, 30, 'odontologico'),
(1, 1, 'Limpeza Dental', 'Remoção de tártaro e profilaxia', 200.00, 60, 'odontologico'),
(1, 1, 'Clareamento', 'Clareamento dental a laser', 800.00, 90, 'odontologico'),
(1, 1, 'Extração', 'Extração de dente', 350.00, 60, 'odontologico'),
(1, 1, 'Canal', 'Tratamento de canal', 1200.00, 120, 'odontologico'),
(1, 2, 'Aplicação de Botox', 'Aplicação de toxina botulínica', 600.00, 45, 'estetico'),
(1, 2, 'Preenchimento Labial', 'Preenchimento com ácido hialurônico', 1200.00, 60, 'estetico'),
(1, 3, 'Microcirurgia', 'Procedimento cirúrgico minimamente invasivo', 2500.00, 120, 'cirurgico');

-- Inserir materiais iniciais
INSERT INTO materiais (loja_id, nome, descricao, quantidade, unidade, quantidade_minima, preco_unitario, categoria) VALUES 
(1, 'Luvas de Procedimento', 'Luvas de látex tamanho M', 500, 'un', 100, 0.50, 'consumivel'),
(1, 'Máscaras Descartáveis', 'Máscaras tripla camada', 300, 'un', 50, 1.20, 'consumivel'),
(1, 'Anestésico', 'Lidocaína 2%', 50, 'tubete', 20, 3.50, 'medicamento'),
(1, 'Seringas', 'Seringas descartáveis 5ml', 200, 'un', 50, 0.80, 'consumivel'),
(1, 'Algodão', 'Algodão hidrófilo', 20, 'pacote', 5, 8.00, 'consumivel');