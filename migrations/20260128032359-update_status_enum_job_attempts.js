'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Rename the old ENUM type
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_job_attempts_status" RENAME TO "enum_job_attempts_status_old";
    `)

    // 2. Create the new ENUM type with only 'success' and 'failed'
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_job_attempts_status" AS ENUM('success', 'failed');
    `)

    // 3. Alter the column to use the new ENUM type
    await queryInterface.sequelize.query(`
      ALTER TABLE "job_attempts" 
      ALTER COLUMN "status" TYPE "enum_job_attempts_status" USING "status"::text::enum_job_attempts_status;
    `)

    // 4. Drop the old ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_job_attempts_status_old";
    `)
  },

  async down(queryInterface, Sequelize) {
    // Rollback: recreate the old ENUM
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_job_attempts_status_old" AS ENUM('in_progress', 'success', 'failed', 'timeout');
    `)
    await queryInterface.sequelize.query(`
      ALTER TABLE "job_attempts"
      ALTER COLUMN "status" TYPE "enum_job_attempts_status_old" USING "status"::text::enum_job_attempts_status_old;
    `)
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_job_attempts_status";
    `)
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_job_attempts_status_old" RENAME TO "enum_job_attempts_status";
    `)
  }
}
