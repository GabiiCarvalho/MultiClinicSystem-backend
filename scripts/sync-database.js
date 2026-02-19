const { sequelize } = require('../models');

async function syncDatabase() {
  try {
    console.log('🔄 Sincronizando banco de dados...');
    
    // Isso vai criar todas as tabelas na ordem correta baseada nos modelos
    await sequelize.sync({ force: true });
    
    console.log('✅ Banco sincronizado com sucesso!');
    
    // Criar dados iniciais
    const { Loja, Pessoa } = require('../models');
    
    const loja = await Loja.create({
      nome: 'Clínica Odonto & Estética',
      endereco: 'Av. Principal, 1000',
      telefone: '47999999999',
      email: 'contato@clinica.com',
      cnpj: '12345678000199',
      ativa: true
    });
    
    console.log('✅ Loja criada');
    
    // Criar alguns pacientes
    await Pessoa.create({
      nome: 'João Silva',
      telefone: '47988888888',
      email: 'joao@email.com',
      tipo: 'paciente',
      loja_id: loja.id
    });
    
    await Pessoa.create({
      nome: 'Maria Oliveira',
      telefone: '47977777777',
      email: 'maria@email.com',
      tipo: 'paciente',
      loja_id: loja.id
    });
    
    console.log('✅ Dados iniciais criados');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();