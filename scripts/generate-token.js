require('dotenv').config();
const jwt = require('jsonwebtoken');
const { Pessoa } = require('../models');

async function generateToken(email) {
  const usuario = await Pessoa.findOne({
    where: { email }
  });

  if (!usuario) {
    console.log('❌ Usuário não encontrado');
    return;
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      nome: usuario.nome,
      role: usuario.tipo,
      clinica_id: usuario.clinica_id
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  console.log('\n🔑 Token gerado:\n');
  console.log(token);
}

const email = process.argv[2];
if (!email) {
  console.log('Use: node scripts/generate-token.js email@teste.com');
  process.exit();
}

generateToken(email);