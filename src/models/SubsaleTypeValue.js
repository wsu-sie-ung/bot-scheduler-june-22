import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class SubsaleTypeValue extends Model {
    static associate(models) {
      // Define associations here if needed
      SubsaleTypeValue.hasMany(models.Subsale, {
        foreignKey: 'type',
        as: 'subsales',
      })
    }
  }

  SubsaleTypeValue.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING(191),
        allowNull: true,
        comment: 'Grouping key (e.g., property_type, furnishing, etc.)',
      },
      value: {
        type: DataTypes.STRING(191),
        allowNull: true,
        comment: 'Actual value or code',
      },
      label: {
        type: DataTypes.STRING(191),
        allowNull: true,
        comment: 'Display label',
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
      modelName: 'SubsaleTypeValue',
      tableName: 'subsale_type_values',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: false,
      paranoid: false,
    }
  )

  return SubsaleTypeValue
}
