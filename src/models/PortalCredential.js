import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class PortalCredential extends Model {
    static associate(models) {
      // Define associations here
      PortalCredential.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      })
      PortalCredential.belongsTo(models.Portal, {
        foreignKey: 'portal_id',
        as: 'portal',
      })
    }
  }

  PortalCredential.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      portal_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
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
      modelName: 'PortalCredential',
      // tableName: 'v_portal_credentials',
      tableName: 'portal_credentials',
      timestamps: false,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: false,
      paranoid: false,
      indexes: [
        {
          fields: ['user_id'],
        },
        {
          fields: ['portal_id'],
        },
      ],
    }
  )

  return PortalCredential
}
