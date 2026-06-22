import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class SubsaleContent extends Model {
    static associate(models) {
      SubsaleContent.belongsTo(models.Subsale, {
        foreignKey: 'subsale_id',
        as: 'subsale',
      })
    }
  }

  SubsaleContent.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      subsale_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      local_path: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      cloud_path: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      cloud_url: {
        type: DataTypes.TEXT, // Using TEXT as URLs can be long
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
      modelName: 'SubsaleContent',
      // tableName: 'v_subsale_contents',
      tableName: 'subsale_contents',
      timestamps: false,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: false,
      paranoid: false,
      indexes: [
        {
          fields: ['subsale_id'],
        },
      ],
    }
  )

  return SubsaleContent
}
