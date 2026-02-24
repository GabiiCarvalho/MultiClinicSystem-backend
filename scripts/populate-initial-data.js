const { sequelize, Clinica, Pessoa, Categoria, Procedimento, Material } = require('../models');
const bcrypt = require('bcryptjs');

async function populate() {
  try {
    console.log('🔄 Criando dados iniciais...');

    const clinica = await Clinica.create({
      nome: 'Clínica Sorriso',
      telefone: '47999999999',
      email: 'contato@clinica.com',
      ativa: true
    });

    const senhaHash = await bcrypt.hash('123456', 10);

    await Pessoa.create({
      nome: 'Gestor Master',
      email: 'gestor@clinica.com',
      senha: senhaHash,
      tipo: 'gestor',
      clinica_id: clinica.id
    });

    await Categoria.bulkCreate([
      { nome: 'Geral', clinica_id: clinica.id },
      { nome: 'Estética', clinica_id: clinica.id }
    ]);

    await Procedimento.bulkCreate([
      { nome: 'Consulta', preco: 150, duracao_minutos: 30, clinica_id: clinica.id },
      { nome: 'Limpeza', preco: 200, duracao_minutos: 60, clinica_id: clinica.id }
    ]);

    await Material.bulkCreate([
      { nome: 'Luvas', quantidade: 300, unidade: 'un', quantidade_minima: 50, preco_unitario: 0.50, clinica_id: clinica.id }
    ]);

    console.log('✅ Dados criados com sucesso');

  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

populate();