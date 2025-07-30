module.exports = (sequelize, DataTypes) => {
  const ITSystem = sequelize.define('ITSystem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    systemId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    responsibleParty: {
      type: DataTypes.STRING,
    },
    vendor: {
      type: DataTypes.STRING,
    },
    version: {
      type: DataTypes.STRING,
    },
    hostingType: {
      type: DataTypes.ENUM('cloud', 'on-premise', 'hybrid'),
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'planned', 'retired'),
      defaultValue: 'active',
    },
    dataClassification: {
      type: DataTypes.ENUM('public', 'internal', 'confidential', 'restricted'),
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  });

  ITSystem.associate = (models) => {
    ITSystem.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization',
    });
    ITSystem.belongsToMany(models.Vendor, {
      through: 'VendorITSystem',
      foreignKey: 'itSystemId',
      otherKey: 'vendorId',
      as: 'vendors',
    });
    ITSystem.belongsToMany(models.ProcessingActivity, {
      through: 'ProcessingActivityITSystem',
      foreignKey: 'itSystemId',
      otherKey: 'processingActivityId',
      as: 'processingActivities',
    });
  };

  return ITSystem;
}; 