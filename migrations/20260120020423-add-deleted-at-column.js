'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('jobs', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    })
    await queryInterface.addColumn('job_attempts', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('jobs', 'deleted_at')
    await queryInterface.removeColumn('job_attempts', 'deleted_at')
  },
}
