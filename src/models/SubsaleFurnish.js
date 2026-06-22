
import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class SubsaleFurnish extends Model {
    static associate(models) {
      // Define associations here if needed
      SubsaleFurnish.belongsTo(models.PropertyCategory, {
        foreignKey: 'property_category_id',
        as: 'property_category',
      })
    }
  }

  SubsaleFurnish.init(
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
      type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
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
      modelName: 'SubsaleFurnish',
      // tableName: 'v_subsale_furnishes',
      tableName: 'subsale_furnishes',
      timestamps: false,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: false,
      paranoid: false,
    }
  )

  return SubsaleFurnish
}
