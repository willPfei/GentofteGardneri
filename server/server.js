const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database paths
const SYSTEMS_DB = path.join(__dirname, 'db', 'systems.json');
const ACTIVITIES_DB = path.join(__dirname, 'db', 'activities.json');
const ORGANIZATION_DB = path.join(__dirname, 'db', 'organization.json');
const UNITS_DB = path.join(__dirname, 'db', 'units.json');

// Helper function to read JSON files
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty array/object
      return filePath.includes('systems') || filePath.includes('activities') || filePath.includes('units') 
        ? [] 
        : {};
    }
    throw error;
  }
}

// Helper function to write to JSON files
async function writeJsonFile(filePath, data) {
  const dirPath = path.dirname(filePath);
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  return data;
}

// Systems routes
app.get('/api/systems', async (req, res) => {
  try {
    const systems = await readJsonFile(SYSTEMS_DB);
    res.json(systems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load systems' });
  }
});

app.post('/api/systems', async (req, res) => {
  try {
    const systems = await readJsonFile(SYSTEMS_DB);
    const newSystem = {
      id: `s${Date.now().toString().slice(-5)}`,
      ...req.body
    };
    systems.push(newSystem);
    await writeJsonFile(SYSTEMS_DB, systems);
    res.status(201).json(newSystem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create system' });
  }
});

app.put('/api/systems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let systems = await readJsonFile(SYSTEMS_DB);
    
    const updatedSystems = systems.map(system => 
      system.id === id ? { ...system, ...req.body, id } : system
    );
    
    await writeJsonFile(SYSTEMS_DB, updatedSystems);
    res.json({ ...req.body, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update system' });
  }
});

app.delete('/api/systems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let systems = await readJsonFile(SYSTEMS_DB);
    
    systems = systems.filter(system => system.id !== id);
    await writeJsonFile(SYSTEMS_DB, systems);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete system' });
  }
});

// Activities routes
app.get('/api/activities', async (req, res) => {
  try {
    const activities = await readJsonFile(ACTIVITIES_DB);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load activities' });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    const activities = await readJsonFile(ACTIVITIES_DB);
    const newActivity = {
      id: `a${Date.now().toString().slice(-5)}`,
      ...req.body
    };
    activities.push(newActivity);
    await writeJsonFile(ACTIVITIES_DB, activities);
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

app.put('/api/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let activities = await readJsonFile(ACTIVITIES_DB);
    
    const updatedActivities = activities.map(activity => 
      activity.id === id ? { ...activity, ...req.body, id } : activity
    );
    
    await writeJsonFile(ACTIVITIES_DB, updatedActivities);
    res.json({ ...req.body, id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let activities = await readJsonFile(ACTIVITIES_DB);
    
    activities = activities.filter(activity => activity.id !== id);
    await writeJsonFile(ACTIVITIES_DB, activities);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

// Organization routes
app.get('/api/organization', async (req, res) => {
  try {
    const organization = await readJsonFile(ORGANIZATION_DB);
    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load organization' });
  }
});

app.get('/api/organization/units', async (req, res) => {
  try {
    const units = await readJsonFile(UNITS_DB);
    res.json(units);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load organizational units' });
  }
});

app.post('/api/organization/units', async (req, res) => {
  try {
    const units = await readJsonFile(UNITS_DB);
    const newUnit = {
      id: `ou${Date.now().toString().slice(-5)}`,
      ...req.body
    };
    units.push(newUnit);
    await writeJsonFile(UNITS_DB, units);
    res.status(201).json(newUnit);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create unit' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/`);
});

