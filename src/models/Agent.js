import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class Agent extends Model {
    static associate(models) {
      // Define associations here if needed
      Agent.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' })
      Agent.hasMany(models.Job, { foreignKey: 'agent_id', as: 'jobs' })
    }
  }

  Agent.init(
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      nric: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      propnex_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      rems_user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      branch_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      ranking: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      business_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      company_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      referral_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      referral_auth_token: {
        type: DataTypes.STRING(255),
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
      modelName: 'Agent',
      // tableName: 'v_agents',
      tableName: 'agents',
      timestamps: false,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: false,
      paranoid: false,
    }
  )

  return Agent
}
