import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class Portal extends Model {
    static associate(models) {
      // Define associations here
      Portal.hasMany(models.PortalCredential, {
        foreignKey: 'portal_id',
        as: 'credentials',
      })
    }
  }

  Portal.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      portal_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN, // Using BOOLEAN as it's a binary state
        allowNull: false,
        defaultValue: true,
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
      modelName: 'Portal',
      // tableName: 'v_portals',
      tableName: 'portals',
      timestamps: false,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: false,
      paranoid: false,
    }
  )

  return Portal
}
