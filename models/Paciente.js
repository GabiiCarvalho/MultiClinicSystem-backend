module.exports = (sequelize, DataTypes) => {
  const Paciente = sequelize.define('Paciente', {
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      validate: {
        isEmail: true
      }
    },
    cpf: {
      type: DataTypes.STRING(14),
      unique: true,
      validate: {
        len: [11, 14]
      }
    },
    data_nascimento: {
      type: DataTypes.DATEONLY
    },
    endereco: {
      type: DataTypes.TEXT
    },
    observacoes: {
      type: DataTypes.TEXT
    },
    convenio: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    numero_convenio: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    alergias: {
      type: DataTypes.TEXT
    },
    medicamentos_continuos: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'pacientes',
    timestamps: true,
    createdAt: 'data_criacao',
    updatedAt: 'data_atualizacao'
  });

  Paciente.associate = (models) => {
    Paciente.belongsTo(models.Loja, { 
      foreignKey: 'loja_id',
      as: 'loja' 
    });
    Paciente.hasMany(models.Agendamento, { 
      foreignKey: 'paciente_id',
      as: 'agendamentos' 
    });
    Paciente.hasMany(models.Venda, { 
      foreignKey: 'paciente_id',
      as: 'vendas' 
    });
    Paciente.hasMany(models.Orcamento, {
      foreignKey: 'paciente_id',
      as: 'orcamentos'
    });
  };

  return Paciente;
};