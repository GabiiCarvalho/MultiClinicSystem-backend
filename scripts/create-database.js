const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
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

    // Verifica se o banco já existe
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'multiclinic_db']
    );

    if (res.rows.length === 0) {
      // Cria o banco de dados
      await client.query(
        `CREATE DATABASE ${process.env.DB_NAME || 'multiclinic_db'}`
      );
      console.log(`✅ Banco de dados "${process.env.DB_NAME || 'multiclinic_db'}" criado!`);
    } else {
      console.log(`ℹ️ Banco de dados "${process.env.DB_NAME || 'multiclinic_db'}" já existe`);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

createDatabase();