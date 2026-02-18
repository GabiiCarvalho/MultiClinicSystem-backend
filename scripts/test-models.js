require('dotenv').config();
const db = require('../models');

async function testModels() {
  console.log('🔍 Testando modelos da Clínica Odontológica...\n');
  
  try {
    await db.sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida\n');

    // Testar criação de lojaa
    const loja = await db.Loja.create({
      nome: 'Clínica Teste',
      endereco: 'Rua Teste, 123',
      telefone: '47999999999',
      email: 'teste@clinica.com',
      cnpj: '12345678000199',
      ativa: true
    });
    console.log('✅ Loja criada com sucesso');

    // Testar criação de usuário com diferentes cargos
    const proprietario = await db.Usuario.create({
      nome: 'Proprietário Teste',
      email: 'proprietario@teste.com',
      senha_hash: 'hash_teste',
      cargo: 'proprietario',
      loja_id: loja.id,
      ativo: true
    });
    console.log('✅ Usuário proprietário criado');

    const dentista = await db.Usuario.create({
      nome: 'Dentista Teste',
      email: 'dentista@teste.com',
      senha_hash: 'hash_teste',
      cargo: 'dentista',
      especialidade: 'Odontologia Geral',
      cro: '12345-SC',
      loja_id: loja.id,
      ativo: true
    });
    console.log('✅ Usuário dentista criado');

    const atendente = await db.Usuario.create({
      nome: 'Atendente Teste',
      email: 'atendente@teste.com',
      senha_hash: 'hash_teste',
      cargo: 'atendente',
      loja_id: loja.id,
      ativo: true
    });
    console.log('✅ Usuário atendente criado');

    // Testar criação de categoria
    const categoria = await db.Categoria.create({
      nome: 'Odontologia Teste',
      descricao: 'Categoria de teste',
      tipo: 'odontologico',
      loja_id: loja.id
    });
    console.log('✅ Categoria criada');

    // Testar criação de procedimento
    const procedimento = await db.Procedimento.create({
      nome: 'Procedimento Teste',
      descricao: 'Procedimento de teste',
      preco: 100.00,
      duracao_minutos: 30,
      tipo: 'odontologico',
      categoria_id: categoria.id,
      loja_id: loja.id,
      ativo: true
    });
    console.log('✅ Procedimento criado');

    // Testar criação de paciente
    const paciente = await db.Paciente.create({
      nome: 'Paciente Teste',
      telefone: '47988888888',
      email: 'paciente@teste.com',
      cpf: '12345678901',
      data_nascimento: '1990-01-01',
      endereco: 'Rua do Paciente, 456',
      loja_id: loja.id
    });
    console.log('✅ Paciente criado');

    // Testar criação de material
    const material = await db.Material.create({
      nome: 'Material Teste',
      descricao: 'Material de teste',
      quantidade: 100,
      unidade: 'un',
      quantidade_minima: 10,
      preco_unitario: 5.00,
      categoria: 'consumivel',
      loja_id: loja.id
    });
    console.log('✅ Material criado');

    // Testar criação de agendamento
    const agendamento = await db.Agendamento.create({
      data_hora: new Date(),
      data_hora_fim: new Date(Date.now() + 3600000), // +1 hora
      status: 'agendado',
      observacoes: 'Agendamento de teste',
      paciente_id: paciente.id,
      dentista_id: dentista.id,
      usuario_id: atendente.id,
      loja_id: loja.id
    });
    console.log('✅ Agendamento criado');

    // Testar criação de agendamento item
    const agendamentoItem = await db.AgendamentoItem.create({
      nome_procedimento: procedimento.nome,
      descricao_procedimento: procedimento.descricao,
      preco: procedimento.preco,
      status: 'pendente',
      agendamento_id: agendamento.id,
      procedimento_id: procedimento.id
    });
    console.log('✅ Item de agendamento criado');

    // Testar criação de venda
    const venda = await db.Venda.create({
      subtotal: procedimento.preco,
      total: procedimento.preco,
      forma_pagamento: 'pix',
      status: 'pago',
      paciente_id: paciente.id,
      usuario_id: atendente.id,
      loja_id: loja.id
    });
    console.log('✅ Venda criada');

    // Testar criação de venda item
    const vendaItem = await db.VendaItem.create({
      item_nome: procedimento.nome,
      item_descricao: procedimento.descricao,
      quantidade: 1,
      preco_unitario: procedimento.preco,
      total: procedimento.preco,
      venda_id: venda.id,
      procedimento_id: procedimento.id
    });
    console.log('✅ Item de venda criado');

    // Testar criação de orçamento
    const orcamento = await db.Orcamento.create({
      subtotal: procedimento.preco,
      total: procedimento.preco,
      validade: new Date(Date.now() + 30 * 24 * 3600000), // +30 dias
      status: 'ativo',
      paciente_id: paciente.id,
      usuario_id: atendente.id,
      loja_id: loja.id
    });
    console.log('✅ Orçamento criado');

    // Testar criação de orçamento item
    const orcamentoItem = await db.OrcamentoItem.create({
      procedimento_nome: procedimento.nome,
      procedimento_descricao: procedimento.descricao,
      quantidade: 1,
      preco_unitario: procedimento.preco,
      total: procedimento.preco,
      orcamento_id: orcamento.id,
      procedimento_id: procedimento.id
    });
    console.log('✅ Item de orçamento criado');

    // Testar relacionamentos
    console.log('\n🔗 Testando relacionamentos:');
    
    const pacienteComAgendamentos = await db.Paciente.findByPk(paciente.id, {
      include: [{ model: db.Agendamento, as: 'agendamentos' }]
    });
    console.log(`   Paciente ${pacienteComAgendamentos.nome} tem ${pacienteComAgendamentos.agendamentos.length} agendamento(s)`);

    const dentistaComAgendamentos = await db.Usuario.findByPk(dentista.id, {
      include: [{ model: db.Agendamento, as: 'agendamentos' }]
    });
    console.log(`   Dentista ${dentistaComAgendamentos.nome} tem ${dentistaComAgendamentos.agendamentos.length} agendamento(s)`);

    const procedimentoComCategoria = await db.Procedimento.findByPk(procedimento.id, {
      include: [{ model: db.Categoria, as: 'categoria' }]
    });
    console.log(`   Procedimento ${procedimentoComCategoria.nome} pertence à categoria ${procedimentoComCategoria.categoria.nome}`);

    console.log('\n✅ Todos os modelos e relacionamentos funcionam corretamente!\n');

  } catch (error) {
    console.error('❌ Erro ao testar modelos:', error);
  } finally {
    await db.sequelize.close();
  }
}

testModels();