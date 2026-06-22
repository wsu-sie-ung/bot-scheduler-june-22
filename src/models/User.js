import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Country, {
        foreignKey: 'country_id',
        as: 'country',
      })
      // User.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(191),
        allowNull: false,
        unique: true,
      },
      username: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(191),
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      avatar: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      country_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      role_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      birthday: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      confirmation_token: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      two_factor_country_code: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      two_factor_phone: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      two_factor_options: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      remember_token: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'created_at',
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'User',
      // tableName: 'v_users',
      tableName: 'users',
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ['email'],
        },
        {
          fields: ['created_at'],
        },
        {
          fields: ['username'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['country_id'],
        },
        {
          fields: ['role_id'],
        },
      ],
    }
  )

  return User
}
