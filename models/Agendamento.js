module.exports = (sequelize, DataTypes) => {
  const Agendamento = sequelize.define('Agendamento', {
    data_hora: {
      type: DataTypes.DATE,
      allowNull: false
    },
    data_hora_fim: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'),
      defaultValue: 'agendado'
    },
    observacoes: {
      type: DataTypes.TEXT
    },
    motivo_cancelamento: {
      type: DataTypes.TEXT
    },
    tipo_procedimento: {
      type: DataTypes.STRING(100)
    }
  }, {
    tableName: 'agendamentos',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  Agendamento.associate = (models) => {
    Agendamento.belongsTo(models.Loja, { 
      foreignKey: 'loja_id',
      as: 'loja' 
    });
    Agendamento.belongsTo(models.Paciente, { 
      foreignKey: 'paciente_id',
      as: 'paciente' 
    });
    Agendamento.belongsTo(models.Usuario, { 
      foreignKey: 'dentista_id',
      as: 'dentista',
      constraints: false
    });
    Agendamento.belongsTo(models.Usuario, { 
      foreignKey: 'usuario_id',
      as: 'usuario' 
    });
    Agendamento.hasMany(models.AgendamentoItem, { 
      foreignKey: 'agendamento_id',
      as: 'itens' 
    });
  };

  return Agendamento;
};