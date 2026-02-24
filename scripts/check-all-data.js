const { sequelize, Clinica, Pessoa, Categoria, Procedimento, Agendamento, Pagamento, Material } = require('../models');

async function checkAllData() {
  console.log('🔍 Verificando dados...\n');

  const clinicas = await Clinica.findAll();
  console.log(`🏥 Clínicas: ${clinicas.length}`);

  const pessoas = await Pessoa.findAll();
  console.log(`👥 Pessoas: ${pessoas.length}`);

  const categorias = await Categoria.findAll();
  console.log(`📁 Categorias: ${categorias.length}`);

  const procedimentos = await Procedimento.findAll();
  console.log(`🦷 Procedimentos: ${procedimentos.length}`);

  const agendamentos = await Agendamento.findAll();
  console.log(`📅 Agendamentos: ${agendamentos.length}`);

  const pagamentos = await Pagamento.findAll();
  console.log(`💰 Pagamentos: ${pagamentos.length}`);

  const materiais = await Material.findAll();
  console.log(`📦 Materiais: ${materiais.length}`);

  await sequelize.close();
}

checkAllData();