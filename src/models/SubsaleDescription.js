import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class SubsaleDescription extends Model {
    static associate(models) {
      SubsaleDescription.belongsTo(models.Subsale, {
        foreignKey: 'subsale_id',
        as: 'subsale',
      })
    }
  }

  SubsaleDescription.init(
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
      description: {
        type: DataTypes.TEXT,
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
      modelName: 'SubsaleDescription',
      // tableName: 'v_subsale_descriptions',
      tableName: 'subsale_descriptions',
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

  return SubsaleDescription
}
