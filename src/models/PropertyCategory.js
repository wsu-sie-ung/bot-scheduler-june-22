
import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class PropertyCategory extends Model {
    static associate(models) {
      PropertyCategory.hasMany(models.PropertyType, {
        foreignKey: 'property_category_id',
        as: 'property_types',
      })
    }
  }

  PropertyCategory.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING(191),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(191),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'PropertyCategory',
      // tableName: 'v_property_categories',
      tableName: 'property_categories',
      timestamps: false,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: false,
      paranoid: false,
    }
  )

  return PropertyCategory
}
