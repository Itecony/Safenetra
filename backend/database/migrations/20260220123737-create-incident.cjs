'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('incidents', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },

      status: {
        type: Sequelize.ENUM('ACTIVE', 'RESOLVED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },

      triggered_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
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

    // Index for faster user lookups
    await queryInterface.addIndex('incidents', ['user_id']);

    // Partial unique index: Only one ACTIVE incident per user
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX unique_active_incident_per_user
      ON incidents(user_id)
      WHERE status = 'ACTIVE';
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('incidents');

    // Drop ENUM manually (Sequelize doesn't auto-clean ENUM types)
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_incidents_status";`
    );
  }
};