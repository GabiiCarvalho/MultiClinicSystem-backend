const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    senha_hash: { type: DataTypes.STRING, allowNull: false },
    cargo: {
      type: DataTypes.ENUM('proprietario', 'gestor', 'dentista', 'atendente', 'financeiro'),
      defaultValue: 'atendente'
    },
    ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
    clinica_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'clinicas', key: 'id' }
    }
  }, {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  Usuario.associate = (models) => {
    Usuario.belongsTo(models.Clinica, { foreignKey: 'clinica_id' });
    Usuario.hasMany(models.Agendamento, { foreignKey: 'usuario_id' });
    Usuario.hasMany(models.Venda, { foreignKey: 'usuario_id' });
  };

  return Usuario;
};