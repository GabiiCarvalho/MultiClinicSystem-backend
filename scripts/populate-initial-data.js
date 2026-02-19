const { sequelize, Loja, Pessoa, Categoria, Procedimento, Material } = require('../models');
const bcrypt = require('bcryptjs');

async function populateInitialData() {
  try {
    console.log('🔄 Populando dados iniciais...');

    // 1. Criar loja
    const [loja, created] = await Loja.findOrCreate({
      where: { cnpj: '12345678000199' },
      defaults: {
        nome: 'Clínica Sorriso',
        endereco: 'Av. Principal, 1000',
        telefone: '47999999999',
        email: 'contato@clinicasorriso.com',
        cnpj: '12345678000199',
        ativa: true
      }
    });

    console.log(`✅ Loja: ${loja.nome} ${created ? 'criada' : 'já existe'}`);

    // 2. Criar usuário proprietário
    const senhaHash = await bcrypt.hash('123456', 10);
    const [proprietario, createdProp] = await Pessoa.findOrCreate({
      where: { email: 'gabi.05assis9@gmail.com' },
      defaults: {
        nome: 'Gabriela Assis',
        email: 'gabi.05assis9@gmail.com',
        senha: senhaHash,
        telefone: '47999999999',
        whatsapp: '47999999999',
        cpf: '123.456.789-00',
        tipo: 'proprietario',
        cargo: 'proprietario',
        loja_id: loja.id,
        ativo: true
      }
    });

    console.log(`✅ Proprietário: ${proprietario.nome} ${createdProp ? 'criado' : 'já existe'}`);

    // 3. Criar categorias
    const categorias = await Categoria.bulkCreate([
      { nome: 'Odontologia Geral', descricao: 'Procedimentos odontológicos gerais', loja_id: loja.id },
      { nome: 'Estética', descricao: 'Procedimentos estéticos', loja_id: loja.id },
      { nome: 'Cirurgias', descricao: 'Procedimentos cirúrgicos', loja_id: loja.id }
    ], { ignoreDuplicates: true });

    console.log(`✅ ${categorias.length} categorias criadas`);

    // 4. Criar procedimentos
    const procedimentos = await Procedimento.bulkCreate([
      { nome: 'Consulta Odontológica', descricao: 'Avaliação inicial', preco: 150, duracao_minutos: 30, loja_id: loja.id },
      { nome: 'Limpeza Dental', descricao: 'Remoção de tártaro', preco: 200, duracao_minutos: 60, loja_id: loja.id },
      { nome: 'Clareamento', descricao: 'Clareamento a laser', preco: 800, duracao_minutos: 90, loja_id: loja.id },
      { nome: 'Canal', descricao: 'Tratamento de canal', preco: 1200, duracao_minutos: 120, loja_id: loja.id }
    ], { ignoreDuplicates: true });

    console.log(`✅ ${procedimentos.length} procedimentos criados`);

    // 5. Criar materiais
    const materiais = await Material.bulkCreate([
      { nome: 'Luvas', descricao: 'Luvas de procedimento', quantidade: 500, unidade: 'un', quantidade_minima: 100, preco_unitario: 0.50, loja_id: loja.id },
      { nome: 'Máscaras', descricao: 'Máscaras descartáveis', quantidade: 300, unidade: 'un', quantidade_minima: 50, preco_unitario: 1.20, loja_id: loja.id },
      { nome: 'Anestésico', descricao: 'Lidocaína', quantidade: 50, unidade: 'tubete', quantidade_minima: 20, preco_unitario: 3.50, loja_id: loja.id }
    ], { ignoreDuplicates: true });

    console.log(`✅ ${materiais.length} materiais criados`);

    // 6. Criar alguns pacientes de exemplo
    const pacientes = await Pessoa.bulkCreate([
      {
        nome: 'João Silva',
        email: 'joao.silva@email.com',
        telefone: '11988887777',
        whatsapp: '11988887777',
        cpf: '123.456.789-01',
        tipo: 'paciente',
        loja_id: loja.id,
        convenio: 'Unimed',
        alergias: 'Nenhuma'
      },
      {
        nome: 'Maria Oliveira',
        email: 'maria.oliveira@email.com',
        telefone: '11977776666',
        whatsapp: '11977776666',
        cpf: '987.654.321-01',
        tipo: 'paciente',
        loja_id: loja.id,
        convenio: 'Bradesco Saúde'
      }
    ], { ignoreDuplicates: true });

    console.log(`✅ ${pacientes.length} pacientes criados`);

    console.log('\n📊 RESUMO:');
    console.log(`   Loja: ${loja.nome}`);
    console.log(`   Proprietário: ${proprietario.nome}`);
    console.log(`   Categorias: ${categorias.length}`);
    console.log(`   Procedimentos: ${procedimentos.length}`);
    console.log(`   Materiais: ${materiais.length}`);
    console.log(`   Pacientes: ${pacientes.length}`);
    
    console.log('\n✅ Dados iniciais populados com sucesso!');
    console.log('='.repeat(50));
    console.log('🔑 Login: gabi.05assis9@gmail.com');
    console.log('🔐 Senha: Natangabi1609');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Erro ao popular dados:', error);
  } finally {
    await sequelize.close();
  }
}

populateInitialData();