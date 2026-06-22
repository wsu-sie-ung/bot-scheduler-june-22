'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_attempts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED,
      },
      job_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'jobs',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      attempt_number: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('in_progress', 'success', 'failed', 'timeout'),
        allowNull: false,
      },
      worker_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      execution_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      finished_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      execution_timeout_seconds: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 900,
      },
      browser_profile_path: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      eni_id: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      private_ip: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      eip_allocation_id: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      captcha_detected: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      http_status_code: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      failure_reason: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      error_stack: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })

    await queryInterface.addIndex('job_attempts', ['job_id', 'attempt_number'], {
      name: 'idx_job_attempt',
    })
    await queryInterface.addIndex('job_attempts', ['status', 'started_at'], {
      name: 'idx_status_started',
    })
    await queryInterface.addConstraint('job_attempts', {
      fields: ['execution_id'],
      type: 'unique',
      name: 'uk_execution',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('job_attempts')
  },
}
