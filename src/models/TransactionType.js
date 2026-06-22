import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class TransactionType extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  TransactionType.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING(191),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(191),
        allowNull: true,
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
      modelName: 'TransactionType',
      tableName: 'transaction_types',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: false,
      paranoid: false,
    }
  )

  return TransactionType
}
