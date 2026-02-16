module.exports = (sequelize, DataTypes) => {
  const Dentista = sequelize.define('Dentista', {
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cro: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    especialidade: {
      type: DataTypes.STRING(100)
    },
    telefone: {
      type: DataTypes.STRING(20)
    },
    email: {
      type: DataTypes.STRING(100),
      validate: {
        isEmail: true
      }
    },
    horario_inicio: {
      type: DataTypes.TIME
    },
    horario_fim: {
      type: DataTypes.TIME
    },
    dias_atendimento: {
      type: DataTypes.JSON, // Ex: ["segunda", "terca", "quarta", "quinta", "sexta"]
      defaultValue: []
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'dentistas',
    timestamps: true,
    createdAt: 'data_criacao',
    updatedAt: 'data_atualizacao'
  });

  Dentista.associate = (models) => {
    Dentista.belongsTo(models.Loja, { foreignKey: 'loja_id', as: 'loja' });
    Dentista.hasMany(models.Agendamento, { foreignKey: 'dentista_id', as: 'agendamentos' });
  };

  return Dentista;
};