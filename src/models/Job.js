import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class Job extends Model {
    static associate(models) {
      Job.belongsTo(models.Agent, {
        foreignKey: 'agent_id',
        as: 'agent',
      })
      Job.hasMany(models.JobAttempt, {
        //1-to-many relationship between Job and JobAttempt, one job can have many attempts
        foreignKey: 'job_id',
        as: 'attempts', //alias for the relationship
        onDelete: 'CASCADE', //if a Job is deleted, all its related JobAttempts are automatically deleted.
      })
    }
  }

  Job.init(
    //define column, types, table options
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      agent_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      platform: {
        type: DataTypes.ENUM('propertyguru', 'iproperty'),
        allowNull: false,
      },
      repost_subsale_id: {
        // FK to repost_subsales.id (INTEGER UNSIGNED to match that table).
        // Nullable: legacy jobs and the (inactive) auto-discovery generator
        // create jobs with no originating repost.
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      unit_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      // portal_listing_id: {
      //   type: DataTypes.CHAR(12),
      //   allowNull: true,
      //   comment:
      //     'External portal listing ID (typically 9 digits, up to 12, may include leading zeros)',
      // },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'in_progress',
          'success',
          'failed',
          'timeout',
          'cooldown',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'pending',
      },
      // request_delete: {
      //   type: DataTypes.TINYINT.UNSIGNED,
      //   allowNull: false,
      //   defaultValue: 0,
      //   comment: '0 = no delete request, 1 = delete requested',
      // },
      scheduled_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      max_retries: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 3,
      },
      agent_trust_score: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: false,
      },
      platform_sensitivity_score: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
      },
      cooldown_until: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      post_to_propertyguru: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      post_to_iproperty: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // sequence_number: {
      //   type: DataTypes.INTEGER.UNSIGNED,
      //   allowNull: true,
      //   comment: '5-digit sequence number, duplicates allowed',
      // },
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
      modelName: 'Job',
      // tableName: 'jobs', //table in db will be named jobs
      tableName: 'poster_jobs',
      timestamps: true, //sequelize will manage createdAt and updatedAt
      paranoid: true, //soft delete
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      indexes: [
        {
          fields: ['status', 'scheduled_at'],
        },
        {
          fields: ['agent_id', 'platform'],
        },
      ],
    }
  )

  return Job
}
