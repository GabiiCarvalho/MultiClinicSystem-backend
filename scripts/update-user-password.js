const { Pessoa, sequelize } = require('../models');

async function updateUserPassword() {
  try {
    console.log('🔧 Atualizando senha do usuário...');

    const usuario = await Pessoa.findOne({ 
      where: { email: 'gabi.05assis9@gmail.com' } 
    });

    if (!usuario) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    // Adiciona campo senha se não existir
    await sequelize.query(`
      ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS senha VARCHAR(255);
    `);

    // Atualiza a senha
    usuario.senha = '123456';
    await usuario.save();

    console.log('✅ Senha atualizada para o usuário:', usuario.email);
    console.log('🔑 Nova senha: 123456');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await sequelize.close();
  }
}

updateUserPassword();