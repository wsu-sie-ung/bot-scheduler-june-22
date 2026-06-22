
import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class PropertyType extends Model {
    static associate(models) {
      PropertyType.belongsTo(models.PropertyCategory, {
        foreignKey: 'property_category_id',
        as: 'property_category',
      })
    }
  }

  PropertyType.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      property_category_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      parent_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      level: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(191),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(191),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      sort_order: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
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
      modelName: 'PropertyType',
      // tableName: 'v_property_types',
      tableName: 'property_types',
      timestamps: false,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: false,
      paranoid: false,
    }
  )

  return PropertyType
}
