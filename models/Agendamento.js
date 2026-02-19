const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Agendamento = sequelize.define('Agendamento', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    paciente_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dentista_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    data_hora: {
      type: DataTypes.DATE,
      allowNull: false
    },
    data_hora_fim: {
      type: DataTypes.DATE,
      allowNull: false
    },
    procedimento: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    procedimento_descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'),
      defaultValue: 'agendado'
    },
    pagamento_status: {
      type: DataTypes.ENUM('pendente', 'pago', 'cancelado'),
      defaultValue: 'pendente'
    },
    pagamento_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    loja_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'agendamentos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Agendamento.associate = (models) => {
    Agendamento.belongsTo(models.Loja, { foreignKey: 'loja_id', as: 'loja' });
    Agendamento.belongsTo(models.Pessoa, { foreignKey: 'paciente_id', as: 'paciente' });
    Agendamento.belongsTo(models.Pessoa, { foreignKey: 'dentista_id', as: 'dentista' });
    Agendamento.belongsTo(models.Pessoa, { foreignKey: 'usuario_id', as: 'usuario' });
    Agendamento.belongsTo(models.Pagamento, { foreignKey: 'pagamento_id', as: 'pagamento' });
  };

  return Agendamento;
};