module.exports = (sequelize, DataTypes) => {
  const Categoria = sequelize.define('Categoria', {
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    descricao: {
      type: DataTypes.TEXT
    },
    tipo: {
      type: DataTypes.ENUM('odontologico', 'estetico', 'cirurgico'),
      defaultValue: 'odontologico'
    }
  }, {
    tableName: 'categorias',
    timestamps: true,
    createdAt: 'data_criacao',
    updatedAt: 'data_atualizacao'
  });

  Categoria.associate = (models) => {
    Categoria.belongsTo(models.Loja, { 
      foreignKey: 'loja_id',
      as: 'loja' 
    });
    Categoria.hasMany(models.Procedimento, { 
      foreignKey: 'categoria_id',
      as: 'procedimentos' 
    });
  };

  return Categoria;
};