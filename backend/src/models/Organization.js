module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define('Organization', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
    },
    website: {
      type: DataTypes.STRING,
    },
    industry: {
      type: DataTypes.STRING,
    },
    size: {
      type: DataTypes.STRING,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });

  Organization.associate = (models) => {
    Organization.hasMany(models.User, {
      foreignKey: 'organizationId',
      as: 'users',
    });
    Organization.hasMany(models.Vendor, {
      foreignKey: 'organizationId',
      as: 'vendors',
    });
    Organization.hasMany(models.ITSystem, {
      foreignKey: 'organizationId',
      as: 'itSystems',
    });
    Organization.hasMany(models.ProcessingActivity, {
      foreignKey: 'organizationId',
      as: 'processingActivities',
    });
  };

  return Organization;
}; 