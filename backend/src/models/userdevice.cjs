'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserDevice extends Model {
    static associate(models) {
      UserDevice.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }

  UserDevice.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },

      install_id: {
        type: DataTypes.UUID,
        allowNull: false
      },

      platform: {
        type: DataTypes.STRING,
        allowNull: false
      },

      app_package_name: {
        type: DataTypes.STRING,
        allowNull: true
      },

      app_version: {
        type: DataTypes.STRING,
        allowNull: true
      },

      build_number: {
        type: DataTypes.STRING,
        allowNull: true
      },

      network_type: {
        type: DataTypes.STRING,
        allowNull: true
      },

      network_isp: {
        type: DataTypes.STRING,
        allowNull: true
      },

      manufacturer: {
        type: DataTypes.STRING,
        allowNull: true
      },

      brand: {
        type: DataTypes.STRING,
        allowNull: true
      },

      model: {
        type: DataTypes.STRING,
        allowNull: true
      },

      device_identifier: {
        type: DataTypes.STRING,
        allowNull: true
      },

      product: {
        type: DataTypes.STRING,
        allowNull: true
      },

      os_version: {
        type: DataTypes.STRING,
        allowNull: true
      },

      sdk_int: {
        type: DataTypes.INTEGER,
        allowNull: true
      },

      security_patch: {
        type: DataTypes.STRING,
        allowNull: true
      },

      is_physical_device: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },

      locale: {
        type: DataTypes.STRING,
        allowNull: true
      },

      timezone: {
        type: DataTypes.STRING,
        allowNull: true
      },

      first_login_at: {
        type: DataTypes.DATE,
        allowNull: false
      },

      last_login_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'UserDevice',
      tableName: 'user_devices',
      underscored: true,
      timestamps: true
    }
  );

  return UserDevice;
};