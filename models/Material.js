const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Material = sequelize.define('Material', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(100), allowNull: false },
    quantidade: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    preco_unitario: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    clinica_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'clinicas', key: 'id' }
    }
  }, {
    tableName: 'materiais',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Material.associate = (models) => {
    Material.belongsTo(models.Clinica, { foreignKey: 'clinica_id' });
  };

  return Material;
};