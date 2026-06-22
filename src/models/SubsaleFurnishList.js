import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class SubsaleFurnishList extends Model {
    static associate(models) {
      SubsaleFurnishList.belongsTo(models.Subsale, {
        foreignKey: 'subsale_id',
        as: 'subsale',
      })
      SubsaleFurnishList.belongsTo(models.SubsaleFurnish, {
        foreignKey: 'subsale_furnish_id',
        as: 'furnish',
      })
    }
  }

  SubsaleFurnishList.init(
    {
      subsale_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      subsale_furnish_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
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
      modelName: 'SubsaleFurnishList',
      // tableName: 'v_subsale_furnish_lists',
      tableName: 'subsale_furnish_lists',
      timestamps: false,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: false,
      paranoid: false,
    }
  )

  return SubsaleFurnishList
}
