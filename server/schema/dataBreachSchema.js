/**
 * Database schema for Data Breach Management module
 */

const createDataBreachTables = `
-- Data Breaches table
CREATE TABLE IF NOT EXISTS data_breaches (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  breach_date TEXT NOT NULL,
  detection_date TEXT NOT NULL,
  reported_by TEXT NOT NULL,
  affected_data_subjects TEXT,
  affected_data_types TEXT,
  affected_systems TEXT,
  severity TEXT CHECK(severity IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
  breach_type TEXT CHECK(breach_type IN ('confidentiality', 'integrity', 'availability', 'multiple')) NOT NULL,
  status TEXT CHECK(status IN ('detected', 'assessed', 'contained', 'notified', 'recovered', 'analyzed', 'closed')) DEFAULT 'detected',
  potential_impact TEXT,
  dpo_assessment TEXT,
  notify_authorities BOOLEAN DEFAULT 0,
  notify_data_subjects BOOLEAN DEFAULT 0,
  notification_date TEXT,
  organizational_unit_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  closed_at TEXT
);

-- Breach Actions table - for tracking all actions taken
CREATE TABLE IF NOT EXISTS breach_actions (
  id TEXT PRIMARY KEY,
  breach_id TEXT NOT NULL,
  action_type TEXT CHECK(action_type IN ('containment', 'eradication', 'recovery', 'notification', 'analysis', 'prevention')) NOT NULL,
  description TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  action_date TEXT NOT NULL,
  status TEXT CHECK(status IN ('planned', 'in-progress', 'completed', 'failed')) DEFAULT 'planned',
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (breach_id) REFERENCES data_breaches(id) ON DELETE CASCADE
);

-- Breach Notifications table - for tracking notifications to authorities and data subjects
CREATE TABLE IF NOT EXISTS breach_notifications (
  id TEXT PRIMARY KEY,
  breach_id TEXT NOT NULL,
  notification_type TEXT CHECK(notification_type IN ('authority', 'data_subject', 'internal', 'other')) NOT NULL,
  recipient TEXT NOT NULL,
  notification_date TEXT NOT NULL,
  notification_method TEXT CHECK(notification_method IN ('email', 'letter', 'phone', 'in-person', 'other')) NOT NULL,
  content TEXT,
  response_received BOOLEAN DEFAULT 0,
  response_date TEXT,
  response_details TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (breach_id) REFERENCES data_breaches(id) ON DELETE CASCADE
);

-- Breach Attachments table - for storing documents related to the breach
CREATE TABLE IF NOT EXISTS breach_attachments (
  id TEXT PRIMARY KEY,
  breach_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by TEXT NOT NULL,
  upload_date TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (breach_id) REFERENCES data_breaches(id) ON DELETE CASCADE
);

-- Breach Analysis table - for post-breach analysis and lessons learned
CREATE TABLE IF NOT EXISTS breach_analysis (
  id TEXT PRIMARY KEY,
  breach_id TEXT NOT NULL,
  root_cause TEXT,
  impact_assessment TEXT,
  lessons_learned TEXT,
  recommended_actions TEXT,
  analyzed_by TEXT NOT NULL,
  analysis_date TEXT NOT NULL,
  reviewed_by TEXT,
  review_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (breach_id) REFERENCES data_breaches(id) ON DELETE CASCADE
);

-- Breach Prevention Measures table - for tracking prevention measures after analysis
CREATE TABLE IF NOT EXISTS breach_prevention_measures (
  id TEXT PRIMARY KEY,
  breach_id TEXT NOT NULL,
  measure_type TEXT CHECK(measure_type IN ('technical', 'organizational', 'training', 'policy', 'other')) NOT NULL,
  description TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  deadline TEXT,
  status TEXT CHECK(status IN ('planned', 'in-progress', 'implemented', 'verified', 'cancelled')) DEFAULT 'planned',
  implementation_date TEXT,
  verification_date TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (breach_id) REFERENCES data_breaches(id) ON DELETE CASCADE
);
`;

module.exports = { createDataBreachTables }; 