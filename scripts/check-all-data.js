const { sequelize, Loja, Pessoa, Categoria, Procedimento, Agendamento, Pagamento, Material } = require('../models');
const { Op } = require('sequelize');

async function checkAllData() {
  console.log('='.repeat(70));
  console.log('🔍 VERIFICANDO TODOS OS DADOS DO BANCO');
  console.log('='.repeat(70));

  try {
    // 1. Lojas
    const lojas = await Loja.findAll();
    console.log(`\n🏢 LOJAS (${lojas.length}):`);
    lojas.forEach(l => {
      console.log(`   ID: ${l.id} | ${l.nome} | CNPJ: ${l.cnpj} | Ativa: ${l.ativa ? '✅' : '❌'}`);
    });

    // 2. Pessoas (Todos os usuários)
    const pessoas = await Pessoa.findAll({
      include: [{ model: Loja, as: 'loja' }],
      order: [['tipo', 'ASC'], ['nome', 'ASC']]
    });

    console.log(`\n👥 PESSOAS (${pessoas.length}):`);
    console.log('   ' + '-'.repeat(60));
    
    const pacientes = pessoas.filter(p => p.tipo === 'paciente');
    const funcionarios = pessoas.filter(p => p.tipo !== 'paciente');

    console.log(`   PACIENTES (${pacientes.length}):`);
    pacientes.forEach(p => {
      console.log(`      ID: ${p.id} | ${p.nome} | ${p.email} | Tel: ${p.telefone}`);
      if (p.convenio) console.log(`         Convênio: ${p.convenio}`);
    });

    console.log(`\n   FUNCIONÁRIOS (${funcionarios.length}):`);
    funcionarios.forEach(f => {
      console.log(`      ID: ${f.id} | ${f.nome} | Cargo: ${f.cargo || f.tipo}`);
      console.log(`         Email: ${f.email} | Tel: ${f.telefone}`);
      if (f.cro) console.log(`         CRO: ${f.cro} | Especialidade: ${f.especialidade || 'N/A'}`);
      console.log(`         Loja: ${f.loja?.nome || f.loja_id}`);
    });

    // 3. Categorias
    const categorias = await Categoria.findAll({
      include: [{ model: Loja, as: 'loja' }]
    });
    console.log(`\n📁 CATEGORIAS (${categorias.length}):`);
    categorias.forEach(c => {
      console.log(`   ID: ${c.id} | ${c.nome} | ${c.descricao || 'Sem descrição'}`);
    });

    // 4. Procedimentos
    const procedimentos = await Procedimento.findAll({
      include: [
        { model: Loja, as: 'loja' },
        { model: Categoria, as: 'categoria' }
      ]
    });
    console.log(`\n🦷 PROCEDIMENTOS (${procedimentos.length}):`);
    procedimentos.forEach(p => {
      console.log(`   ID: ${p.id} | ${p.nome}`);
      console.log(`      Preço: R$ ${parseFloat(p.preco).toFixed(2)} | Duração: ${p.duracao_minutos}min`);
      console.log(`      Categoria: ${p.categoria?.nome || 'N/A'}`);
    });

    // 5. Agendamentos
    const agendamentos = await Agendamento.findAll({
      include: [
        { model: Pessoa, as: 'paciente' },
        { model: Pessoa, as: 'dentista' },
        { model: Loja, as: 'loja' }
      ],
      order: [['data_hora', 'DESC']]
    });
    console.log(`\n📅 AGENDAMENTOS (${agendamentos.length}):`);
    agendamentos.forEach(a => {
      console.log(`   ID: ${a.id} | Data: ${new Date(a.data_hora).toLocaleString()}`);
      console.log(`      Paciente: ${a.paciente?.nome || 'N/A'}`);
      console.log(`      Dentista: ${a.dentista?.nome || 'N/A'}`);
      console.log(`      Procedimento: ${a.procedimento}`);
      console.log(`      Status: ${a.status} | Pago: ${a.pago ? '✅' : '❌'}`);
      console.log(`      Valor: R$ ${parseFloat(a.valor).toFixed(2)}`);
    });

    // 6. Pagamentos
    const pagamentos = await Pagamento.findAll({
      include: [
        { model: Pessoa, as: 'paciente' },
        { model: Pessoa, as: 'usuario' },
        { model: Loja, as: 'loja' }
      ],
      order: [['data_pagamento', 'DESC']]
    });
    console.log(`\n💰 PAGAMENTOS (${pagamentos.length}):`);
    pagamentos.forEach(p => {
      console.log(`   ID: ${p.id} | Data: ${new Date(p.data_pagamento).toLocaleString()}`);
      console.log(`      Paciente: ${p.paciente?.nome || 'N/A'}`);
      console.log(`      Total: R$ ${parseFloat(p.total).toFixed(2)}`);
      console.log(`      Forma: ${p.forma_pagamento} | Status: ${p.status}`);
    });

    // 7. Materiais
    const materiais = await Material.findAll({
      include: [{ model: Loja, as: 'loja' }]
    });
    console.log(`\n📦 MATERIAIS (${materiais.length}):`);
    materiais.forEach(m => {
      const status = m.quantidade <= 0 ? '❌ ESGOTADO' : 
                     m.quantidade <= m.quantidade_minima ? '⚠️ BAIXO' : '✅ OK';
      console.log(`   ID: ${m.id} | ${m.nome} | ${status}`);
      console.log(`      Quantidade: ${m.quantidade} ${m.unidade} | Mínimo: ${m.quantidade_minima}`);
      console.log(`      Preço: R$ ${parseFloat(m.preco_unitario).toFixed(2)}`);
    });

    // 8. Estatísticas gerais
    console.log('\n📊 ESTATÍSTICAS GERAIS:');
    console.log(`   Total de Lojas: ${lojas.length}`);
    console.log(`   Total de Pessoas: ${pessoas.length}`);
    console.log(`      - Pacientes: ${pacientes.length}`);
    console.log(`      - Funcionários: ${funcionarios.length}`);
    console.log(`   Total de Categorias: ${categorias.length}`);
    console.log(`   Total de Procedimentos: ${procedimentos.length}`);
    console.log(`   Total de Agendamentos: ${agendamentos.length}`);
    console.log(`      - Pendentes: ${agendamentos.filter(a => !a.pago).length}`);
    console.log(`      - Pagos: ${agendamentos.filter(a => a.pago).length}`);
    console.log(`   Total de Pagamentos: ${pagamentos.length}`);
    console.log(`   Valor Total em Pagamentos: R$ ${pagamentos.reduce((sum, p) => sum + parseFloat(p.total || 0), 0).toFixed(2)}`);
    console.log(`   Total de Materiais: ${materiais.length}`);
    console.log(`   Valor em Estoque: R$ ${materiais.reduce((sum, m) => sum + (parseFloat(m.quantidade) * parseFloat(m.preco_unitario)), 0).toFixed(2)}`);

    console.log('\n✅ VERIFICAÇÃO CONCLUÍDA');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
  } finally {
    await sequelize.close();
  }
}

checkAllData();