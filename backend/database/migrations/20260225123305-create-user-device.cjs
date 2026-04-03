'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_devices', {
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
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      install_id: {
        type: Sequelize.UUID,
        allowNull: false
      },

      platform: {
        type: Sequelize.STRING,
        allowNull: false
      },

      app_package_name: Sequelize.STRING,
      app_version: Sequelize.STRING,
      build_number: Sequelize.STRING,
      network_type: Sequelize.STRING,
      network_isp: Sequelize.STRING,
      manufacturer: Sequelize.STRING,
      brand: Sequelize.STRING,
      model: Sequelize.STRING,
      device_identifier: Sequelize.STRING,
      product: Sequelize.STRING,
      os_version: Sequelize.STRING,
      sdk_int: Sequelize.INTEGER,
      security_patch: Sequelize.STRING,
      is_physical_device: Sequelize.BOOLEAN,
      locale: Sequelize.STRING,
      timezone: Sequelize.STRING,

      first_login_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },

      last_login_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addConstraint('user_devices', {
      fields: ['user_id', 'install_id'],
      type: 'unique',
      name: 'unique_user_device_install'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_devices');
  }
};