const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Clinica = sequelize.define('Clinica', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    endereco: DataTypes.TEXT,
    telefone: DataTypes.STRING(20),
    email: DataTypes.STRING(100),
    cnpj: {
      type: DataTypes.STRING(18),
      unique: true
    },
    ativa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'clinicas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Clinica.associate = (models) => {
    Clinica.hasMany(models.Usuario, { foreignKey: 'clinica_id' });
    Clinica.hasMany(models.Paciente, { foreignKey: 'clinica_id' });
    Clinica.hasMany(models.Agendamento, { foreignKey: 'clinica_id' });
    Clinica.hasMany(models.Procedimento, { foreignKey: 'clinica_id' });
    Clinica.hasMany(models.Material, { foreignKey: 'clinica_id' });
    Clinica.hasMany(models.Venda, { foreignKey: 'clinica_id' });
    Clinica.hasMany(models.Orcamento, { foreignKey: 'clinica_id' });
  };

  return Clinica;
};