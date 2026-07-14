import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class RepostSubsale extends Model {
    static associate(models) {
      RepostSubsale.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      })

      RepostSubsale.belongsTo(models.Subsale, {
        foreignKey: 'subsale_id',
        as: 'subsale',
      })
    }
  }

  RepostSubsale.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      subsale_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      portal_ids: {
        type: DataTypes.TEXT('long'),
        allowNull: false,

        get() {
          const raw = this.getDataValue('portal_ids')
          if (!raw) return []

          try {
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed : []
          } catch (e) {
            return []
          }
        },

        set(value) {
          this.setDataValue(
            'portal_ids',
            JSON.stringify(Array.isArray(value) ? value : [])
          )
        },
      },

      posting_channel: {
        type: DataTypes.ENUM('propertyguru', 'iproperty'),
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'processed'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Repost processing status',
      },

      processed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },

      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },

      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: 'RepostSubsale',
      tableName: 'repost_subsales',

      timestamps: false,
      createdAt: 'created_at',
      updatedAt: 'updated_at',

      indexes: [
        {
          name: 'repost_subsales_user_id_index',
          fields: ['user_id'],
        },
        {
          name: 'repost_subsales_subsale_id_index',
          fields: ['subsale_id'],
        },
        {
          name: 'repost_subsales_status_index',
          fields: ['status'],
        },
      ],
    }
  )

  return RepostSubsale
}