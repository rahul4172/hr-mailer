-- HR Mailer Pro - PostgreSQL Database Schema
-- Designed for high security, data integrity, and fast queries

-- Users table (Stores profile & encrypted OAuth tokens)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  access_token TEXT,
  refresh_token_encrypted TEXT,
  token_expiry BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_body TEXT NOT NULL,
  signature TEXT,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'running', 'paused', 'completed', 'cancelled')),
  total_count INTEGER DEFAULT 0,
  valid_count INTEGER DEFAULT 0,
  invalid_count INTEGER DEFAULT 0,
  duplicate_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  min_delay_sec INTEGER DEFAULT 10,
  max_delay_sec INTEGER DEFAULT 25,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Campaign Recipients / Emails table
CREATE TABLE IF NOT EXISTS campaign_emails (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  company_name TEXT,
  recipient_name TEXT,
  personalized_subject TEXT,
  personalized_body TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sending', 'sent', 'failed')),
  attempts INTEGER DEFAULT 0,
  error_reason TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- User Settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  min_delay_sec INTEGER DEFAULT 10,
  max_delay_sec INTEGER DEFAULT 25,
  max_retries INTEGER DEFAULT 3,
  default_signature TEXT,
  theme_preference TEXT DEFAULT 'auto' CHECK(theme_preference IN ('auto', 'dark', 'light')),
  sound_notifications INTEGER DEFAULT 1,
  desktop_notifications INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Activity Logs table for Security Auditing
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_campaign_id ON campaign_emails(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_emails_status ON campaign_emails(status);
CREATE INDEX IF NOT EXISTS idx_attachments_campaign_id ON attachments(campaign_id);
