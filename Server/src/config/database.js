const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'gameplan_db',
    user: process.env.DB_USER || 'gameplan_user',
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Pool event handlers
pool.on('connect', (client) => {
    console.log('🔗 New database client connected');
});

pool.on('error', (err, client) => {
    console.error('💥 Unexpected error on idle database client:', err);
    process.exit(-1);
});

pool.on('acquire', (client) => {
    console.log('📊 Database client acquired from pool');
});

pool.on('remove', (client) => {
    console.log('🗑️  Database client removed from pool');
});

// Test database connection
const testConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time, version() as version');
        console.log('✅ Database connection successful!');
        console.log(`🕐 Current time: ${result.rows[0].current_time}`);
        console.log(`🐘 PostgreSQL version: ${result.rows[0].version.split(' ')[1]}`);
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Query helper function
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        if (process.env.NODE_ENV === 'development') {
            console.log('📊 Executed query:', {
                text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
                duration: `${duration}ms`,
                rows: result.rowCount
            });
        }

        return result;
    } catch (error) {
        const duration = Date.now() - start;
        console.error('💥 Query error:', {
            text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
            duration: `${duration}ms`,
            error: error.message
        });
        throw error;
    }
};

// Transaction helper function
const transaction = async (callback) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Get client from pool (for complex operations)
const getClient = async () => {
    return await pool.connect();
};

// Close pool gracefully
const closePool = async () => {
    try {
        await pool.end();
        console.log('🔒 Database pool closed successfully');
    } catch (error) {
        console.error('❌ Error closing database pool:', error.message);
    }
};

// Database health check
const healthCheck = async () => {
    try {
        const result = await query('SELECT 1 as health');
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            response_time: Date.now()
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        };
    }
};

// Get pool stats
const getPoolStats = () => {
    return {
        total_connections: pool.totalCount,
        idle_connections: pool.idleCount,
        waiting_connections: pool.waitingCount
    };
};

module.exports = {
    pool,
    query,
    transaction,
    getClient,
    testConnection,
    closePool,
    healthCheck,
    getPoolStats,
    dbConfig
};
