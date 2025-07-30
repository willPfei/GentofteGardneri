module.exports = (sequelize, DataTypes) => {
  const ProcessingActivity = sequelize.define('ProcessingActivity', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    activityId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dataSubjects: {
      type: DataTypes.TEXT,
      get() {
        const value = this.getDataValue('dataSubjects');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('dataSubjects', JSON.stringify(value || []));
      }
    },
    dataTypes: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const value = this.getDataValue('dataTypes');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('dataTypes', JSON.stringify(value || []));
      }
    },
    legalBasis: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    retentionPeriod: {
      type: DataTypes.STRING,
    },
    securityMeasures: {
      type: DataTypes.TEXT,
    },
    dataTransfers: {
      type: DataTypes.TEXT,
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'low',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'under_review'),
      defaultValue: 'active',
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  });

  ProcessingActivity.associate = (models) => {
    ProcessingActivity.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization',
    });
    ProcessingActivity.belongsToMany(models.ITSystem, {
      through: 'ProcessingActivityITSystem',
      foreignKey: 'processingActivityId',
      otherKey: 'itSystemId',
      as: 'itSystems',
    });
  };

  return ProcessingActivity;
}; 