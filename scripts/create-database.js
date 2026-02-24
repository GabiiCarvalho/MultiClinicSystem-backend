const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres'
  });

  try {
    await client.connect();

    const dbName = process.env.DB_NAME;

    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (res.rows.length === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Banco ${dbName} criado`);
    } else {
      console.log(`ℹ️ Banco ${dbName} já existe`);
    }

  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
}

createDatabase();