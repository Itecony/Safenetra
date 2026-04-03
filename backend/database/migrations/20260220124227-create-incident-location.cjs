'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('incident_locations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false
      },

      incident_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'incidents',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false
      },

      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false
      },

      accuracy: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      recorded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Critical for performance (location stream queries)
    await queryInterface.addIndex('incident_locations', ['incident_id']);

    // Useful for timeline queries
    await queryInterface.addIndex('incident_locations', ['recorded_at']);

    // Composite index for efficient trail retrieval
    await queryInterface.addIndex('incident_locations', [
      'incident_id',
      'recorded_at'
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('incident_locations');
  }
};