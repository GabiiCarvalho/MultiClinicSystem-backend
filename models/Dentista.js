module.exports = (sequelize, DataTypes) => {
  const Dentista = sequelize.define('Dentista', {
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    cro: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    especialidade: {
      type: DataTypes.STRING(100)
    },
    telefone: {
      type: DataTypes.STRING(20)
    },
    email: {
      type: DataTypes.STRING(150)
    },
    clinica_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'dentistas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Dentista.associate = (models) => {
    Dentista.belongsTo(models.Clinica, { foreignKey: 'clinica_id' });
    Dentista.hasMany(models.Agendamento, { foreignKey: 'dentista_id' });
  };

  return Dentista;
};