import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class SubsaleRoom extends Model {
    static associate(models) {
      SubsaleRoom.belongsTo(models.Subsale, {
        foreignKey: 'subsale_id',
        as: 'subsale',
      })
    }
  }

  SubsaleRoom.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      subsale_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      room_type: {
        type: DataTypes.STRING(191),
        allowNull: true,
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
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'SubsaleRoom',
      // tableName: 'v_subsale_rooms',
      tableName: 'subsale_rooms',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: false,
      paranoid: false,
    }
  )

  return SubsaleRoom
}
