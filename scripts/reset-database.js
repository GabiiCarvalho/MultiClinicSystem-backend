const { Client } = require('pg');
require('dotenv').config();

async function resetDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'gabinatan',
    password: process.env.DB_PASSWORD || 'sistemamulticlinic142536!',
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL');

    // Fecha todas as conexões com o banco
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'multiclinic_db'
      AND pid <> pg_backend_pid();
    `);

    // Dropa o banco se existir
    await client.query(`DROP DATABASE IF EXISTS multiclinic_db;`);
    console.log('🗑️ Banco antigo removido');

    // Cria o banco novamente
    await client.query(`CREATE DATABASE multiclinic_db;`);
    console.log('✅ Banco criado');

    console.log('\n🎉 Banco resetado com sucesso!');
    console.log('Agora execute: npx sequelize-cli db:migrate');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

resetDatabase();