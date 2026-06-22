import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class JobAttempt extends Model {
    static associate(models) {
      JobAttempt.belongsTo(models.Job, {
        //many-to-one, one JobAttempt belongs to one Job
        foreignKey: 'job_id',
        as: 'job',
      })
    }
  }

  JobAttempt.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      job_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'jobs',
          key: 'id',
        },
      },
      attempt_number: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM( 'success', 'failed', 'timeout', 'in_progress'),
        allowNull: false,
      },
      worker_id: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      execution_id: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
      started_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      finished_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      execution_timeout_seconds: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 900, //15 mins
      },
      browser_profile_path: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      eni_id: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      private_ip: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      eip_allocation_id: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      captcha_detected: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      http_status_code: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      failure_reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      error_stack: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'deleted_at',
      },
    },
    {
      sequelize,
      modelName: 'JobAttempt',
      tableName: 'job_attempts',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: false, // No updated_at for attempts as per schema
      deletedAt: 'deleted_at',
      indexes: [
        {
          unique: true,
          fields: ['execution_id'],
        },
        {
          fields: ['job_id', 'attempt_number'],
        },
        {
          fields: ['status', 'started_at'],
        },
      ],
    }
  )

  return JobAttempt
}
