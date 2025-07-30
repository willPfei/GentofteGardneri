module.exports = (sequelize, DataTypes) => {
  const Vendor = sequelize.define('Vendor', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    vendorId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vendorName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
    },
    description: {
      type: DataTypes.TEXT,
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'terminated', 'draft'),
      defaultValue: 'active',
    },
    documentUrl: {
      type: DataTypes.STRING,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  });

  Vendor.associate = (models) => {
    Vendor.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization',
    });
    Vendor.belongsToMany(models.ITSystem, {
      through: 'VendorITSystem',
      foreignKey: 'vendorId',
      otherKey: 'itSystemId',
      as: 'itSystems',
    });
  };

  return Vendor;
}; 