'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    // 🔹 Index for fast lookup of active incidents per user
    await queryInterface.addIndex(
      'incidents',
      ['user_id', 'status'],
      {
        name: 'idx_incidents_user_status'
      }
    );

    // 🔹 Index for fetching locations per incident
    await queryInterface.addIndex(
      'incident_locations',
      ['incident_id'],
      {
        name: 'idx_incident_locations_incident_id'
      }
    );

    // 🔹 Index for time-based queries (live tracking, history sorting)
    await queryInterface.addIndex(
      'incident_locations',
      ['recorded_at'],
      {
        name: 'idx_incident_locations_recorded_at'
      }
    );
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeIndex(
      'incidents',
      'idx_incidents_user_status'
    );

    await queryInterface.removeIndex(
      'incident_locations',
      'idx_incident_locations_incident_id'
    );

    await queryInterface.removeIndex(
      'incident_locations',
      'idx_incident_locations_recorded_at'
    );
  }
};