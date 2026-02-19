// config/generate-config.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('🔧 Gerando arquivo de configuração...');

const config = {
  development: {
    username: process.env.DB_USER || 'gabinatan',
    password: process.env.DB_PASSWORD || 'sistemamulticlinic142536!',
    database: process.env.DB_NAME || 'multiclinic_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: console.log
  },
  test: {
    username: process.env.DB_USER || 'gabinatan',
    password: process.env.DB_PASSWORD || 'sistemamulticlinic142536!',
    database: process.env.DB_NAME_TEST || 'multiclinic_test',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false
  },
  production: {
    username: process.env.DB_USER || 'gabinatan',
    password: process.env.DB_PASSWORD || 'sistemamulticlinic142536!',
    database: process.env.DB_NAME || 'multiclinic_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

// Escreve o arquivo config.json
fs.writeFileSync(
  path.join(__dirname, 'config.json'),
  JSON.stringify(config, null, 2)
);

console.log('✅ Arquivo config.json gerado com sucesso!');
console.log('📊 Usuário configurado:', config.development.username);