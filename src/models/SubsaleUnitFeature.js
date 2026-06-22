import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class SubsaleUnitFeature extends Model {
    static associate(models) {
      // Define associations here if needed
      // Example: SubsaleUnitFeature.hasMany(models.SubsaleUnitFeatureList, ...)
    }
  }

  SubsaleUnitFeature.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      code: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'SubsaleUnitFeature',
      tableName: 'subsale_unit_features',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: false,
      paranoid: false,
    }
  )

  return SubsaleUnitFeature
}
