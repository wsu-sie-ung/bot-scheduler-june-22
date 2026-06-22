import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class City extends Model {
    static associate(models) {
      City.belongsTo(models.State, {
        foreignKey: 'state_id',
        as: 'state',
      })
      City.belongsTo(models.Country, {
        foreignKey: 'country_id',
        as: 'country',
      })
    }
  }

  City.init(
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
      state_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      state_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      country_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      country_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
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
      modelName: 'City',
      // tableName: 'v_cities',
      tableName: 'cities',
      timestamps: false,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: false,
      paranoid: false,
      indexes: [
        {
          fields: ['state_id'],
        },
        {
          fields: ['country_id'],
        },
      ],
    }
  )

  return City
}
