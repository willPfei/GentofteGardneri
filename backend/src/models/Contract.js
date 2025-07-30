module.exports = (sequelize, DataTypes) => {
  const Contract = sequelize.define('Contract', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    contractId: {
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

  Contract.associate = (models) => {
    Contract.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization',
    });
    Contract.belongsToMany(models.ITSystem, {
      through: 'ContractITSystem',
      foreignKey: 'contractId',
      otherKey: 'itSystemId',
      as: 'itSystems',
    });
  };

  return Contract;
}; 