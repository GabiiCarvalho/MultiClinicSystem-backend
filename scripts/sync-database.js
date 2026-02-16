// scripts/sync-database.js
require('dotenv').config();
const db = require('../models');
const bcrypt = require('bcryptjs');

async function syncDatabase() {
  try {
    console.log('🔄 Sincronizando banco de dados da Clínica Odontológica...\n');
    
    // ATENÇÃO: Isso apagará todos os dados existentes!
    console.log('⚠️  CUIDADO: Isso irá APAGAR todos os dados existentes!');
    console.log('   Pressione Ctrl+C para cancelar ou aguarde 5 segundos...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('🗑️  Recriando tabelas...');
    await db.sequelize.sync({ force: true });
    
    console.log('✅ Banco de dados sincronizado com sucesso!\n');
    
    // Criar dados de teste
    await createTestData();
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco:', error);
  } finally {
    await db.sequelize.close();
  }
}

async function createTestData() {
  try {
    console.log('📝 Criando dados de teste...\n');
    
    // Criar loja
    const loja = await db.Loja.create({
      nome: 'Clínica Odonto & Estética',
      endereco: 'Av. Principal, 1000',
      telefone: '47999999999',
      email: 'contato@clinica.com',
      cnpj: '12345678000199',
      ativa: true
    });
    console.log('✅ Loja criada:', loja.nome);

    // Criar categorias de procedimentos
    const categorias = await db.Categoria.bulkCreate([
      { 
        nome: 'Odontologia Geral', 
        descricao: 'Procedimentos odontológicos gerais',
        tipo: 'odontologico',
        loja_id: loja.id 
      },
      { 
        nome: 'Estética Facial', 
        descricao: 'Procedimentos estéticos faciais',
        tipo: 'estetico',
        loja_id: loja.id 
      },
      { 
        nome: 'Cirurgias', 
        descricao: 'Procedimentos cirúrgicos',
        tipo: 'cirurgico',
        loja_id: loja.id 
      }
    ]);
    console.log('✅ Categorias criadas:', categorias.length);

    // Criar procedimentos
    const procedimentos = await db.Procedimento.bulkCreate([
      {
        nome: 'Consulta Odontológica',
        descricao: 'Avaliação inicial com dentista',
        preco: 150.00,
        duracao_minutos: 30,
        tipo: 'odontologico',
        categoria_id: categorias[0].id,
        loja_id: loja.id,
        ativo: true
      },
      {
        nome: 'Limpeza Dental',
        descricao: 'Remoção de tártaro e profilaxia',
        preco: 200.00,
        duracao_minutos: 60,
        tipo: 'odontologico',
        categoria_id: categorias[0].id,
        loja_id: loja.id,
        ativo: true
      },
      {
        nome: 'Clareamento',
        descricao: 'Clareamento dental a laser',
        preco: 800.00,
        duracao_minutos: 90,
        tipo: 'odontologico',
        categoria_id: categorias[0].id,
        loja_id: loja.id,
        ativo: true
      },
      {
        nome: 'Aplicação de Botox',
        descricao: 'Aplicação de toxina botulínica',
        preco: 600.00,
        duracao_minutos: 45,
        tipo: 'estetico',
        categoria_id: categorias[1].id,
        loja_id: loja.id,
        ativo: true
      },
      {
        nome: 'Preenchimento Labial',
        descricao: 'Preenchimento com ácido hialurônico',
        preco: 1200.00,
        duracao_minutos: 60,
        tipo: 'estetico',
        categoria_id: categorias[1].id,
        loja_id: loja.id,
        ativo: true
      },
      {
        nome: 'Microcirurgia',
        descricao: 'Procedimento cirúrgico minimamente invasivo',
        preco: 2500.00,
        duracao_minutos: 120,
        tipo: 'cirurgico',
        categoria_id: categorias[2].id,
        loja_id: loja.id,
        ativo: true
      }
    ]);
    console.log('✅ Procedimentos criados:', procedimentos.length);

    // Criar usuários com diferentes cargos
    const usuarios = [];
    const cargos = [
      { nome: 'Maria Silva', email: 'proprietario@clinica.com', cargo: 'proprietario' },
      { nome: 'João Santos', email: 'gestor@clinica.com', cargo: 'gestor' },
      { nome: 'Dra. Ana Oliveira', email: 'dentista1@clinica.com', cargo: 'dentista', especialidade: 'Odontologia Geral', cro: '12345-SC' },
      { nome: 'Dr. Carlos Souza', email: 'dentista2@clinica.com', cargo: 'dentista', especialidade: 'Estética Facial', cro: '12346-SC' },
      { nome: 'Dra. Mariana Costa', email: 'dentista3@clinica.com', cargo: 'dentista', especialidade: 'Cirurgia', cro: '12347-SC' },
      { nome: 'Pedro Mendes', email: 'atendente@clinica.com', cargo: 'atendente' },
      { nome: 'Lucia Ferreira', email: 'financeiro@clinica.com', cargo: 'financeiro' }
    ];

    for (const userData of cargos) {
      const senha_hash = await bcrypt.hash('123456', 8);
      const usuario = await db.Usuario.create({
        nome: userData.nome,
        email: userData.email,
        senha_hash: senha_hash,
        cargo: userData.cargo,
        especialidade: userData.especialidade || null,
        cro: userData.cro || null,
        loja_id: loja.id,
        ativo: true
      });
      usuarios.push(usuario);
    }
    console.log('✅ Usuários criados:', usuarios.length);

    // Criar pacientes
    const pacientes = await db.Paciente.bulkCreate([
      {
        nome: 'João da Silva',
        telefone: '47988888888',
        email: 'joao@email.com',
        cpf: '12345678901',
        data_nascimento: '1980-05-15',
        endereco: 'Rua das Flores, 123',
        convenio: 'Unimed',
        numero_convenio: '123456',
        alergias: 'Nenhuma',
        loja_id: loja.id
      },
      {
        nome: 'Maria Oliveira',
        telefone: '47977777777',
        email: 'maria@email.com',
        cpf: '98765432101',
        data_nascimento: '1990-08-22',
        endereco: 'Av. Central, 456',
        convenio: 'Bradesco Saúde',
        numero_convenio: '789012',
        alergias: 'Dipirona',
        loja_id: loja.id
      },
      {
        nome: 'Pedro Santos',
        telefone: '47966666666',
        email: 'pedro@email.com',
        cpf: '45678912301',
        data_nascimento: '1975-03-10',
        endereco: 'Rua da Paz, 789',
        convenio: null,
        alergias: 'Nenhuma',
        loja_id: loja.id
      }
    ]);
    console.log('✅ Pacientes criados:', pacientes.length);

    // Criar materiais
    const materiais = await db.Material.bulkCreate([
      {
        nome: 'Luvas de Procedimento',
        descricao: 'Luvas de látex tamanho M',
        quantidade: 500,
        unidade: 'un',
        quantidade_minima: 100,
        preco_unitario: 0.50,
        fornecedor: 'Distribuidora Saúde',
        categoria: 'consumivel',
        loja_id: loja.id
      },
      {
        nome: 'Máscaras Descartáveis',
        descricao: 'Máscaras tripla camada',
        quantidade: 300,
        unidade: 'un',
        quantidade_minima: 50,
        preco_unitario: 1.20,
        fornecedor: 'MedPlus',
        categoria: 'consumivel',
        loja_id: loja.id
      },
      {
        nome: 'Anestésico',
        descricao: 'Lidocaína 2%',
        quantidade: 50,
        unidade: 'tubete',
        quantidade_minima: 20,
        preco_unitario: 3.50,
        fornecedor: 'DentalFarma',
        categoria: 'medicamento',
        loja_id: loja.id
      }
    ]);
    console.log('✅ Materiais criados:', materiais.length);

    // Criar agendamentos
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    
    const agendamentos = await db.Agendamento.bulkCreate([
      {
        data_hora: new Date(hoje.setHours(9, 0, 0)),
        data_hora_fim: new Date(hoje.setHours(9, 30, 0)),
        status: 'agendado',
        observacoes: 'Primeira consulta',
        paciente_id: pacientes[0].id,
        dentista_id: usuarios[2].id, // Dra. Ana
        usuario_id: usuarios[5].id, // Atendente
        loja_id: loja.id
      },
      {
        data_hora: new Date(hoje.setHours(10, 0, 0)),
        data_hora_fim: new Date(hoje.setHours(11, 0, 0)),
        status: 'confirmado',
        observacoes: 'Limpeza semestral',
        paciente_id: pacientes[1].id,
        dentista_id: usuarios[3].id, // Dr. Carlos
        usuario_id: usuarios[5].id,
        loja_id: loja.id
      },
      {
        data_hora: new Date(amanha.setHours(14, 0, 0)),
        data_hora_fim: new Date(amanha.setHours(15, 30, 0)),
        status: 'agendado',
        observacoes: 'Procedimento estético',
        paciente_id: pacientes[2].id,
        dentista_id: usuarios[3].id,
        usuario_id: usuarios[5].id,
        loja_id: loja.id
      }
    ]);
    console.log('✅ Agendamentos criados:', agendamentos.length);

    console.log('\n🎉 Dados de teste criados com sucesso!\n');
    console.log('='.repeat(50));
    console.log('📧 Emails para login:');
    console.log('  proprietario@clinica.com (Proprietário)');
    console.log('  gestor@clinica.com (Gestor)');
    console.log('  dentista1@clinica.com (Dentista - Odontologia)');
    console.log('  dentista2@clinica.com (Dentista - Estética)');
    console.log('  dentista3@clinica.com (Dentista - Cirurgia)');
    console.log('  atendente@clinica.com (Atendente)');
    console.log('  financeiro@clinica.com (Financeiro)');
    console.log('='.repeat(50));
    console.log('🔐 Senha padrão para todos: 123456');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error);
  }
}

syncDatabase();