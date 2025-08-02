const { Pool } = require("pg");
const fs = require("fs").promises;
const path = require("path");
const config = require("../config");

/**
 * Database Migration Script
 * Creates database and runs schema setup
 */

// Database configuration for initial connection (without specific database)
const adminConfig = {
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
};

// Database configuration with specific database
const dbConfig = {
  ...adminConfig,
  database: config.database.name,
};

/**
 * Create database if it doesn't exist
 */
const createDatabase = async () => {
  const adminPool = new Pool(adminConfig);

  try {
    console.log("🔍 Checking if database exists...");

    // Check if database exists
    const result = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [config.database.name],
    );

    if (result.rows.length === 0) {
      console.log(`📦 Creating database: ${config.database.name}`);
      await adminPool.query(`CREATE DATABASE ${config.database.name}`);
      console.log("✅ Database created successfully");
    } else {
      console.log("✅ Database already exists");
    }
  } catch (error) {
    console.error("❌ Error creating database:", error.message);
    throw error;
  } finally {
    await adminPool.end();
  }
};

/**
 * Run database schema
 */
const runSchema = async () => {
  const pool = new Pool(dbConfig);

  try {
    console.log("🏗️  Running database schema...");

    // Read schema file
    const schemaPath = path.join(__dirname, "../../../DataBase/schema.sql");
    const schema = await fs.readFile(schemaPath, "utf8");

    // Execute schema
    await pool.query(schema);
    console.log("✅ Database schema executed successfully");

    // Verify tables were created
    const tablesResult = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

    console.log("📊 Created tables:");
    tablesResult.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });
  } catch (error) {
    console.error("❌ Error running schema:", error.message);
    throw error;
  } finally {
    await pool.end();
  }
};

/**
 * Insert default data
 */
const insertDefaultData = async () => {
  const pool = new Pool(dbConfig);

  try {
    console.log("🌱 Inserting default data...");

    // Insert default club roles
    const defaultRoles = [
      // Coaching Staff
      {
        name: "Head Coach",
        category: "coaching_staff",
        description: "Main team coach",
        permissions: {
          manage_training: true,
          manage_squad: true,
          view_all: true,
        },
      },
      {
        name: "Assistant Coach",
        category: "coaching_staff",
        description: "Assistant to head coach",
        permissions: { manage_training: true, view_all: true },
      },
      {
        name: "Goalkeeping Coach",
        category: "coaching_staff",
        description: "Specialist goalkeeper coach",
        permissions: { manage_training: true, view_players: true },
      },
      {
        name: "Set Pieces Coach",
        category: "coaching_staff",
        description: "Set pieces specialist",
        permissions: { manage_training: true, view_players: true },
      },

      // Players
      {
        name: "Captain",
        category: "players",
        description: "Team captain",
        permissions: { view_training: true, view_matches: true },
      },
      {
        name: "Player",
        category: "players",
        description: "Regular team player",
        permissions: { view_training: true, view_matches: true },
      },

      // Management
      {
        name: "President",
        category: "management",
        description: "Club president",
        permissions: {
          manage_all: true,
          manage_finances: true,
          manage_members: true,
        },
      },
      {
        name: "Manager",
        category: "management",
        description: "Club manager",
        permissions: {
          manage_finances: true,
          manage_members: true,
          view_all: true,
        },
      },

      // Medical Staff
      {
        name: "Team Doctor",
        category: "medical",
        description: "Team medical doctor",
        permissions: { manage_medical: true, view_players: true },
      },
      {
        name: "Physiotherapist",
        category: "medical",
        description: "Team physiotherapist",
        permissions: { manage_medical: true, view_players: true },
      },
    ];

    for (const role of defaultRoles) {
      const existingRole = await pool.query(
        "SELECT id FROM club_roles WHERE name = $1",
        [role.name],
      );

      if (existingRole.rows.length === 0) {
        await pool.query(
          `
                  INSERT INTO club_roles (name, category, description, permissions, is_system_role, created_at)
                  VALUES ($1, $2, $3, $4, true, NOW())
              `,
          [
            role.name,
            role.category,
            role.description,
            JSON.stringify(role.permissions),
          ],
        );
      }
    }

    // Insert default financial categories
    const defaultCategories = [
      // Income categories
      {
        name: "Membership Fees",
        type: "income",
        description: "Monthly/yearly membership fees from players",
      },
      {
        name: "Match Revenue",
        type: "income",
        description: "Revenue from match tickets and concessions",
      },
      {
        name: "Sponsorship",
        type: "income",
        description: "Sponsorship deals and partnerships",
      },
      {
        name: "Merchandise",
        type: "income",
        description: "Club merchandise sales",
      },
      {
        name: "Grants",
        type: "income",
        description: "Government or federation grants",
      },
      {
        name: "Donations",
        type: "income",
        description: "Donations from supporters",
      },

      // Expense categories
      {
        name: "Player Salaries",
        type: "expense",
        description: "Salaries paid to players",
      },
      {
        name: "Staff Salaries",
        type: "expense",
        description: "Salaries paid to coaching and support staff",
      },
      {
        name: "Equipment",
        type: "expense",
        description: "Sports equipment and gear",
      },
      {
        name: "Facility Rental",
        type: "expense",
        description: "Training ground and stadium rental",
      },
      {
        name: "Travel",
        type: "expense",
        description: "Travel expenses for away matches",
      },
      {
        name: "Medical",
        type: "expense",
        description: "Medical treatments and health services",
      },
      {
        name: "Insurance",
        type: "expense",
        description: "Insurance premiums and coverage",
      },
      {
        name: "Utilities",
        type: "expense",
        description: "Electricity, water, and other utilities",
      },
      {
        name: "Marketing",
        type: "expense",
        description: "Marketing and promotional activities",
      },
    ];

    for (const category of defaultCategories) {
      const existingCategory = await pool.query(
        "SELECT id FROM financial_categories WHERE name = $1",
        [category.name],
      );

      if (existingCategory.rows.length === 0) {
        await pool.query(
          `
                  INSERT INTO financial_categories (name, type, description, is_system_category, created_at)
                  VALUES ($1, $2, $3, true, NOW())
              `,
          [category.name, category.type, category.description],
        );
      }
    }

    // Insert default competitions
    const currentYear = new Date().getFullYear();
    const season = `${currentYear}/${currentYear + 1}`;

    const defaultCompetitions = [
      {
        name: "Premier League",
        season,
        competition_type: "league",
        country: "ENG",
        division: "Premier League",
      },
      {
        name: "FA Cup",
        season,
        competition_type: "cup",
        country: "ENG",
        division: "National Cup",
      },
      {
        name: "Primeira Liga",
        season,
        competition_type: "league",
        country: "POR",
        division: "Primeira Liga",
      },
      {
        name: "Taça de Portugal",
        season,
        competition_type: "cup",
        country: "POR",
        division: "National Cup",
      },
      {
        name: "Champions League",
        season,
        competition_type: "cup",
        country: "EUR",
        division: "Continental Cup",
      },
      {
        name: "Europa League",
        season,
        competition_type: "cup",
        country: "EUR",
        division: "Continental Cup",
      },
    ];

    for (const competition of defaultCompetitions) {
      const existingCompetition = await pool.query(
        "SELECT id FROM competitions WHERE name = $1 AND season = $2",
        [competition.name, competition.season],
      );

      if (existingCompetition.rows.length === 0) {
        await pool.query(
          `
                  INSERT INTO competitions (name, season, competition_type, country, division, start_date, end_date, is_active, created_at)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())
              `,
          [
            competition.name,
            competition.season,
            competition.competition_type,
            competition.country,
            competition.division,
            `${currentYear}-08-01`, // Season start (August)
            `${currentYear + 1}-05-31`, // Season end (May)
          ],
        );
      }
    }

    console.log("✅ Default data inserted successfully");
  } catch (error) {
    console.error("❌ Error inserting default data:", error.message);
    throw error;
  } finally {
    await pool.end();
  }
};

/**
 * Test database connection
 */
const testConnection = async () => {
  const pool = new Pool(dbConfig);

  try {
    console.log("🔍 Testing database connection...");

    const result = await pool.query(
      "SELECT NOW() as current_time, version() as version",
    );
    console.log("✅ Database connection successful!");
    console.log(`🕐 Current time: ${result.rows[0].current_time}`);
    console.log(
      `🐘 PostgreSQL version: ${result.rows[0].version.split(" ")[1]}`,
    );

    // Test some tables
    const tableTests = [
      { name: "users", query: "SELECT COUNT(*) FROM users" },
      { name: "clubs", query: "SELECT COUNT(*) FROM clubs" },
      { name: "club_roles", query: "SELECT COUNT(*) FROM club_roles" },
      {
        name: "financial_categories",
        query: "SELECT COUNT(*) FROM financial_categories",
      },
    ];

    console.log("📊 Table status:");
    for (const test of tableTests) {
      try {
        const result = await pool.query(test.query);
        console.log(`  ✅ ${test.name}: ${result.rows[0].count} records`);
      } catch (error) {
        console.log(`  ❌ ${test.name}: Error - ${error.message}`);
      }
    }
  } catch (error) {
    console.error("❌ Database connection test failed:", error.message);
    throw error;
  } finally {
    await pool.end();
  }
};

/**
 * Main migration function
 */
const migrate = async () => {
  try {
    console.log("🚀 Starting GamePlan database migration...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await createDatabase();
    await runSchema();
    await insertDefaultData();
    await testConnection();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Migration completed successfully!");
    console.log("🎉 GamePlan database is ready to use!");
  } catch (error) {
    console.error("💥 Migration failed:", error.message);
    if (config.app.debug) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
};

/**
 * Reset database (drop and recreate)
 */
const reset = async () => {
  const adminPool = new Pool(adminConfig);

  try {
    console.log("⚠️  WARNING: This will delete all data in the database!");
    console.log("🗑️  Dropping database...");

    // Terminate existing connections
    await adminPool.query(
      `
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = $1 AND pid <> pg_backend_pid()
        `,
      [config.database.name],
    );

    // Drop database
    await adminPool.query(`DROP DATABASE IF EXISTS ${config.database.name}`);
    console.log("✅ Database dropped successfully");

    // Run migration
    await migrate();
  } catch (error) {
    console.error("❌ Reset failed:", error.message);
    throw error;
  } finally {
    await adminPool.end();
  }
};

// Command line interface
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case "reset":
      reset();
      break;
    case "test":
      testConnection();
      break;
    default:
      migrate();
  }
}

module.exports = {
  migrate,
  reset,
  testConnection,
  createDatabase,
  runSchema,
  insertDefaultData,
};
