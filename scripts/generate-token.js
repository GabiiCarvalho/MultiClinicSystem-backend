require('dotenv').config();
const jwt = require('jsonwebtoken');
const { Usuario, Loja } = require('../models');

async function generateTokenForUser(email) {
  try {
    console.log('🔍 Buscando usuário:', email);
    
    const usuario = await Usuario.findOne({
      where: { email },
      include: [{ model: Loja, as: 'loja' }]
    });

    if (!usuario) {
      console.log('❌ Usuário não encontrado');
      console.log('\n📝 Para criar usuários de teste, execute:');
      console.log('  node scripts/populate-database.js');
      return null;
    }

    // Gerar token
    const token = jwt.sign(
      { 
        id: usuario.id, 
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        loja_id: usuario.loja_id 
      },
      process.env.JWT_SECRET || 'segredo_temporario',
      { expiresIn: '7d' }
    );

    console.log('\n✅ Token gerado com sucesso!');
    console.log('='.repeat(50));
    console.log('👤 Usuário:', usuario.nome);
    console.log('📧 Email:', usuario.email);
    console.log('👔 Cargo:', usuario.cargo === 'proprietario' ? 'Proprietário' :
                           usuario.cargo === 'gestor' ? 'Gestor' :
                           usuario.cargo === 'dentista' ? 'Dentista' :
                           usuario.cargo === 'atendente' ? 'Atendente' :
                           usuario.cargo === 'financeiro' ? 'Financeiro' : usuario.cargo);
    console.log('🏪 Loja:', usuario.loja?.nome);
    console.log('='.repeat(50));
    console.log('🔑 Token:', token);
    console.log('='.repeat(50));
    
    console.log('\n📋 Exemplos de uso:');
    console.log('\n1️⃣  Listar pacientes:');
    console.log(`curl -X GET http://localhost:3001/api/pacientes \\`);
    console.log(`  -H "Authorization: Bearer ${token}" \\`);
    console.log(`  -H "Content-Type: application/json"`);
    
    console.log('\n2️⃣  Listar procedimentos:');
    console.log(`curl -X GET http://localhost:3001/api/procedimentos \\`);
    console.log(`  -H "Authorization: Bearer ${token}" \\`);
    console.log(`  -H "Content-Type: application/json"`);
    
    console.log('\n3️⃣  Ver agendamentos do dia:');
    console.log(`curl -X GET "http://localhost:3001/api/agendamentos?data_inicio=$(date +%Y-%m-%d)&data_fim=$(date +%Y-%m-%d)" \\`);
    console.log(`  -H "Authorization: Bearer ${token}" \\`);
    console.log(`  -H "Content-Type: application/json"`);

    return token;
  } catch (error) {
    console.error('❌ Erro ao gerar token:', error);
    return null;
  }
}

// Uso: node scripts/generate-token.js email@exemplo.com
const email = process.argv[2];
if (!email) {
  console.log('⚠️  Por favor, forneça um email como argumento');
  console.log('   Exemplo: node scripts/generate-token.js admin@clinica.com');
  console.log('\n📧 Emails de teste disponíveis:');
  console.log('  - proprietario@clinica.com (Proprietário)');
  console.log('  - gestor@clinica.com (Gestor)');
  console.log('  - dentista@clinica.com (Dentista)');
  console.log('  - atendente@clinica.com (Atendente)');
  console.log('  - financeiro@clinica.com (Financeiro)');
  process.exit(1);
}

generateTokenForUser(email).then(() => process.exit(0));