'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('jobs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED,
      },
      agent_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
      },
      platform: {
        type: Sequelize.ENUM('propertyguru', 'iproperty'),
        allowNull: false,
      },
      unit_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'in_progress',
          'success',
          'failed',
          'cooldown',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'pending',
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      max_retries: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 3,
      },
      agent_trust_score: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false,
      },
      platform_sensitivity_score: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false,
      },
      cooldown_until: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    })

    await queryInterface.addIndex('jobs', ['status', 'scheduled_at'], {
      name: 'idx_status_scheduled',
    })
    await queryInterface.addIndex('jobs', ['agent_id', 'platform'], {
      name: 'idx_agent_platform',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('jobs')
  },
}
