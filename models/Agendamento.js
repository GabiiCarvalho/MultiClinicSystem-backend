const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Agendamento = sequelize.define('Agendamento', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    paciente_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    clinica_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'clinicas', key: 'id' }
    },
    data_hora: { type: DataTypes.DATE, allowNull: false },
    data_hora_fim: { type: DataTypes.DATE, allowNull: false },
    valor: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    status: {
      type: DataTypes.ENUM('agendado', 'confirmado', 'concluido', 'cancelado'),
      defaultValue: 'agendado'
    }
  }, {
    tableName: 'agendamentos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Agendamento.associate = (models) => {
    Agendamento.belongsTo(models.Clinica, { foreignKey: 'clinica_id' });
    Agendamento.belongsTo(models.Paciente, { foreignKey: 'paciente_id' });
    Agendamento.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
  };

  return Agendamento;
};