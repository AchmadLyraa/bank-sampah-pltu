-- Create controller account
-- This script creates the initial controller account
-- Password: controller123 (hashed with bcrypt)

INSERT INTO controller (id, nama, email, password, role, "createdAt", "updatedAt")
VALUES (
  'controller_001',
  'System Controller',
  'controller@banksampah.com',
  '$2b$10$rQJ8YQZ9QZ9QZ9QZ9QZ9QOuKl7WGHuHuHuHuHuHuHuHuHuHuHuHuHu', -- controller123
  'CONTROLLER',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
