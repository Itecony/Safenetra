'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Incident extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Incident.belongsTo(models.User, {
        foreignKey: 'user_id'
      });

      Incident.hasMany(models.IncidentLocation, {
        foreignKey: 'incident_id',
        as: 'locations'
      });
    }
  }
  Incident.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      unique: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'RESOLVED', 'CANCELLED'),
      allowNull: false
    },
    trigger_type: {
      type: DataTypes.ENUM('ONE_TAP', 'SILENT', 'DELAYED'),
      allowNull: false,
      defaultValue: 'ONE_TAP'
    },
    triggered_at: DataTypes.DATE,
    resolved_at: DataTypes.DATE,
    metadata: DataTypes.JSONB
  }, {
    sequelize,
    modelName: 'Incident',
    tableName: 'incidents',
    underscored: true
  });
  return Incident;
};