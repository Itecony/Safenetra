'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('incidents', 'trigger_type', {
      type: Sequelize.ENUM('ONE_TAP', 'SILENT', 'DELAYED'),
      allowNull: false,
      defaultValue: 'ONE_TAP'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('incidents', 'trigger_type');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_incidents_trigger_type";'
    );
  }
};
