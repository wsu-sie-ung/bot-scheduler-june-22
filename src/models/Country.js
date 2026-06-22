import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class Country extends Model {
    static associate(models) {
      Country.hasMany(models.State, {
        foreignKey: 'country_id',
        as: 'states',
      })
      Country.hasMany(models.Subsale, {
        foreignKey: 'country_id',
        as: 'subsales',
      })
    }
  }

  Country.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      capital: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      citizenship: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      country_code: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      currency: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      currency_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      currency_sub_unit: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      currency_symbol: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      full_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      iso_3166_2: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      iso_3166_3: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      region_code: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      sub_region_code: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      eea: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: 0,
      },
      calling_code: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      flag: {
        type: DataTypes.STRING(6),
        allowNull: true,
      },
      // Keep timestamps if they exist in the DB, or remove if the table doesn't have them.
      // Assuming standard Laravel/Sequelize timestamps might exist or not based on the provided query (it was a SELECT, not CREATE).
      // If the table doesn't have created_at/updated_at, we should set timestamps: false.
      // Based on the SELECT query, no created_at/updated_at were selected.
      // I will assume timestamps might be there or not, but usually they are.
      // However, to be safe and strictly follow the columns provided:
    },
    {
      sequelize,
      modelName: 'Country',
      // tableName: 'v_countries',
      tableName: 'countries',
      timestamps: false, // The provided SELECT query didn't show created_at/updated_at, so disabling by default to match input strictly.
      underscored: true,
    }
  )

  return Country
}
