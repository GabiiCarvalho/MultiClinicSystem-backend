require('dotenv').config();
const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 3001;

console.log('🔄 Iniciando servidor...');

db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexão com o banco estabelecida');
    return db.sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log('🚀 Servidor iniciado!');
      console.log(`📍 Porta: ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log('⏰', new Date().toLocaleString());
    });
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao banco:', err.message);
    process.exit(1);
  });