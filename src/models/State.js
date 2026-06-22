import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class State extends Model {
    static associate(models) {
      State.belongsTo(models.Country, {
        foreignKey: 'country_id',
        as: 'country',
      })
      State.hasMany(models.Subsale, {
        foreignKey: 'state_id',
        as: 'subsales',
      })
    }
  }

  State.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      country_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      updated_by: {
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
      modelName: 'State',
      // tableName: 'v_states',
      tableName: 'states',
      timestamps: false,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: false,
      paranoid: false,
      indexes: [
        {
          fields: ['country_id'],
        },
      ],
    }
  )

  return State
}
