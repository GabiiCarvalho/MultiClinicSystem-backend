require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, Clinica, Pessoa } = require('./models');

async function seed() {
  await sequelize.sync({ force: true });

  const clinica = await Clinica.create({
    nome: 'Clinica Central',
    subdominio: 'central'
  });

  const senhaHash = await bcrypt.hash('123456', 10);

  await Pessoa.create({
    nome: 'Administrador',
    email: 'admin@central.com',
    senha: senhaHash,
    tipo: 'gestor',
    clinica_id: clinica.id
  });

  console.log('Seed executado com sucesso');
  process.exit();
}

seed();