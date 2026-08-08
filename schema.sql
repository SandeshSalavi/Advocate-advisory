-- Justly Connect: MySQL schema (replaces Supabase/Postgres)
CREATE DATABASE IF NOT EXISTS justly_connect;
USE justly_connect;

-- Core auth table (replaces Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('client', 'advocate') NOT NULL DEFAULT 'client',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS client_profiles (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  profile_picture TEXT NULL,
  phone_number VARCHAR(50) NULL,
  address VARCHAR(255) NULL,
  bio TEXT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'client',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_client_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS advocate_profiles (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  profile_picture TEXT NULL,
  phone_number VARCHAR(50) NULL,
  address VARCHAR(255) NULL,
  bio TEXT NULL,
  specialization VARCHAR(255) NULL,
  years_of_experience INT NULL,
  availability_status BOOLEAN DEFAULT TRUE,
  average_rating DECIMAL(3,2) DEFAULT 0,
  role VARCHAR(50) NOT NULL DEFAULT 'advocate',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_advocate_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);
