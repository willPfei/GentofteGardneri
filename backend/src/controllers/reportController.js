const { ProcessingActivity, ITSystem, Organization, Vendor } = require('../models');
const { Op } = require('sequelize');

/**
 * Generate a GDPR Article 30 compliant "Records of Processing Activities" report
 * This report pulls data from processing activities, systems, vendors, and the organization
 */
const generateArticle30Report = async (req, res) => {
  try {
    const { organizationId } = req.user;

    // Get organization details
    const organization = await Organization.findByPk(organizationId, {
      attributes: ['id', 'name', 'address', 'email', 'phone', 'website']
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Get all processing activities with their associated IT systems
    const processingActivities = await ProcessingActivity.findAll({
      where: { organizationId },
      include: [
        {
          model: ITSystem,
          as: 'itSystems',
          attributes: ['id', 'systemId', 'name', 'description', 'responsibleParty', 'vendor', 'hostingType', 'dataClassification', 'securityMeasures'],
          through: { attributes: [] },
          include: [
            {
              model: Vendor,
              as: 'vendors',
              attributes: ['id', 'vendorId', 'vendorName', 'description'],
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    // Build the report data structure
    const reportData = {
      organization: {
        name: organization.name,
        address: organization.address,
        email: organization.email,
        phone: organization.phone,
        website: organization.website
      },
      processingActivities: processingActivities.map(activity => {
        // Parse JSON fields if they are stored as strings
        const dataSubjects = typeof activity.dataSubjects === 'string' 
          ? JSON.parse(activity.dataSubjects) 
          : activity.dataSubjects || [];
        
        const dataTypes = typeof activity.dataTypes === 'string'
          ? JSON.parse(activity.dataTypes)
          : activity.dataTypes || [];

        // Extract security measures from linked systems
        const securityMeasures = activity.itSystems
          .map(system => system.securityMeasures)
          .filter(Boolean)
          .join(', ');

        // Extract vendors from linked systems
        const vendors = activity.itSystems
          .flatMap(system => system.vendors || [])
          .map(vendor => ({
            name: vendor.vendorName,
            id: vendor.vendorId,
            description: vendor.description
          }));

        // Create a unique list of vendors
        const uniqueVendors = [...new Map(vendors.map(v => [v.id, v])).values()];

        return {
          activityId: activity.activityId,
          description: activity.description,
          purpose: activity.purpose,
          dataSubjects: dataSubjects,
          dataTypes: dataTypes,
          legalBasis: activity.legalBasis,
          retentionPeriod: activity.retentionPeriod,
          securityMeasures: securityMeasures || activity.securityMeasures || 'Not specified',
          dataTransfers: activity.dataTransfers,
          riskLevel: activity.riskLevel,
          status: activity.status,
          systems: activity.itSystems.map(system => ({
            name: system.name,
            systemId: system.systemId,
            description: system.description,
            responsibleParty: system.responsibleParty,
            hostingType: system.hostingType,
            dataClassification: system.dataClassification
          })),
          vendors: uniqueVendors
        };
      })
    };

    res.json({ report: reportData });
  } catch (error) {
    console.error('Generate Article 30 report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  generateArticle30Report
}; 