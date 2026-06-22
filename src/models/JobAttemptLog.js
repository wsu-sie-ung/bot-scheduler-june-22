import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class JobAttemptLog extends Model {
    static associate(models) {
      JobAttemptLog.belongsTo(models.JobAttempt, {
        foreignKey: 'job_attempt_id',
        as: 'job_attempt',
        onDelete: 'CASCADE',
      })
    }
  }

  JobAttemptLog.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      job_attempt_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'job_attempts',
          key: 'id',
        },
      },

      log_level: {
        type: DataTypes.ENUM('debug', 'info', 'warning', 'error'),
        allowNull: false,
        defaultValue: 'info',
      },

      event_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      message: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },

      context: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      step: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      action: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },

      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: 'JobAttemptLog',
      tableName: 'job_attempt_logs',

      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      paranoid: true,
      deletedAt: 'deleted_at',

      indexes: [
        {
          fields: ['job_attempt_id', 'created_at'],
        },
        {
          fields: ['log_level', 'created_at'],
        },
        {
          fields: ['event_type'],
        },
      ],
    }
  )

  return JobAttemptLog
}