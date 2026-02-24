module.exports = (sequelize, DataTypes) => {
  const Pessoa = sequelize.define('Pessoa', {
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    cpf: {
      type: DataTypes.STRING(20)
    },
    telefone: {
      type: DataTypes.STRING(20)
    },
    email: {
      type: DataTypes.STRING(150)
    },
    data_nascimento: {
      type: DataTypes.DATEONLY
    },
    tipo: {
      type: DataTypes.ENUM('paciente', 'atendente', 'gestor'),
      allowNull: false
    },
    clinica_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'pessoas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Pessoa.associate = (models) => {
    Pessoa.belongsTo(models.Clinica, { foreignKey: 'clinica_id', as: 'clinica' });
  };

  return Pessoa;
};