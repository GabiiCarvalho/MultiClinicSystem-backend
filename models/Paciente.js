module.exports = (sequelize, DataTypes) => {
  const Paciente = sequelize.define('Paciente', {
    nome: { type: DataTypes.STRING(100), allowNull: false },
    telefone: { type: DataTypes.STRING(20), allowNull: false },
    email: { type: DataTypes.STRING(100) },
    cpf: { type: DataTypes.STRING(14), unique: true },
    clinica_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'clinicas', key: 'id' }
    }
  }, {
    tableName: 'pacientes',
    timestamps: true,
    createdAt: 'data_criacao',
    updatedAt: 'data_atualizacao'
  });

  Paciente.associate = (models) => {
    Paciente.belongsTo(models.Clinica, { foreignKey: 'clinica_id' });
    Paciente.hasMany(models.Agendamento, { foreignKey: 'paciente_id' });
  };

  return Paciente;
};