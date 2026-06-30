'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('poster_jobs', 'repost_subsale_id', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'repost_subsales',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      after: 'platform', // MySQL column ordering; harmless on other dialects
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('poster_jobs', 'repost_subsale_id')
  },
}
