// Role-Based Database Connection
const mysql = require('mysql2');
require('dotenv').config();

const pools = {};

// Supported roles for database connections
const SUPPORTED_ROLES = ['Admin', 'Staff', 'Courier', 'Customer'];

// Function to get database configuration based on role
const getDbConfig = (role) => {
  switch (role) {
    case 'Admin':
      return {
        host: process.env.DB_HOST,
        user: process.env.DB_ADMIN_USER,
        password: process.env.DB_ADMIN_PASSWORD,
        database: process.env.DB_NAME,
      };
    case 'Staff':
      return {
        host: process.env.DB_HOST,
        user: process.env.DB_STAFF_USER,
        password: process.env.DB_STAFF_PASSWORD,
        database: process.env.DB_NAME,
      };
    case 'Courier':
      return {
        host: process.env.DB_HOST,
        user: process.env.DB_COURIER_USER,
        password: process.env.DB_COURIER_PASSWORD,
        database: process.env.DB_NAME,
      };
    case 'Customer':
      return {
        host: process.env.DB_HOST,
        user: process.env.DB_CUSTOMER_USER,
        password: process.env.DB_CUSTOMER_PASSWORD,
        database: process.env.DB_NAME,
      };
    default:
      throw new Error(`Invalid role '${role}' for database connection`);
  }
};

// Function to get or create a connection pool based on role
const connectToDatabase = (role) => {
  // Validate the role
  if (!SUPPORTED_ROLES.includes(role)) {
    throw new Error(`Unsupported role '${role}'. Supported roles are: ${SUPPORTED_ROLES.join(', ')}`);
  }

  // Create and store pool if it doesn't exist
  if (!pools[role]) {
    const dbConfig = getDbConfig(role);
    try {
      pools[role] = mysql.createPool(dbConfig).promise();
      console.log(`Database connection pool created for role: ${role}`);
    } catch (error) {
      console.error(`Error creating database connection pool for role '${role}':`, error.message);
      throw error;
    }
  }

  return pools[role];
};

// Function to close all pools on app shutdown
const closeAllPools = async () => {
  const poolClosePromises = Object.keys(pools).map(async (role) => {
    try {
      await pools[role].end();
      console.log(`Database connection pool closed for role: ${role}`);
    } catch (error) {
      console.error(`Error closing database connection pool for role '${role}':`, error.message);
    }
  });

  await Promise.all(poolClosePromises);
  console.log('All database connection pools closed.');
};

module.exports = { connectToDatabase, closeAllPools };
