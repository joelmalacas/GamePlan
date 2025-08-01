# GamePlan Database Structure

## 📊 Database Overview
PostgreSQL database for sports club management system with comprehensive features for training, matches, finances, and member management.

---

## 🏗️ Database Tables Structure

### 👤 **AUTHENTICATION & USERS**

#### `users` (Primary User Table)
```sql
🔑 id                     UUID (PK)
   first_name             VARCHAR(100)
   last_name              VARCHAR(100)
   email                  VARCHAR(255) UNIQUE
   password_hash          VARCHAR(255)
   birth_date             DATE
   country                VARCHAR(3)
   phone                  VARCHAR(20)
   profile_picture_url    TEXT
   is_email_verified      BOOLEAN
   email_verification_token VARCHAR(255)
   password_reset_token   VARCHAR(255)
   password_reset_expires TIMESTAMP
   last_login             TIMESTAMP
   is_active              BOOLEAN
   created_at             TIMESTAMP
   updated_at             TIMESTAMP
```

#### `user_sessions` (Authentication Sessions)
```sql
🔑 id              UUID (PK)
🔗 user_id         UUID (FK → users.id)
   session_token   VARCHAR(255) UNIQUE
   expires_at      TIMESTAMP
   created_at      TIMESTAMP
   ip_address      INET
   user_agent      TEXT
```

---

### 🏟️ **CLUBS & ORGANIZATION**

#### `clubs` (Sports Clubs)
```sql
🔑 id                    UUID (PK)
   name                  VARCHAR(200)
   slug                  VARCHAR(100) UNIQUE
   description           TEXT
   founded_year          INTEGER
   logo_url              TEXT
   cover_image_url       TEXT
   colors                JSONB
   address               TEXT
   city                  VARCHAR(100)
   country               VARCHAR(3)
   postal_code           VARCHAR(20)
   phone                 VARCHAR(20)
   email                 VARCHAR(255)
   website_url           TEXT
   social_media          JSONB
   sport_type            VARCHAR(50)
   division              VARCHAR(100)
   subscription_plan     VARCHAR(50)
   subscription_expires  TIMESTAMP
   is_active             BOOLEAN
   created_at            TIMESTAMP
   updated_at            TIMESTAMP
```

#### `club_roles` (Available Positions/Roles)
```sql
🔑 id               UUID (PK)
   name             VARCHAR(100)
   category         VARCHAR(50)     -- coaching_staff, players, management, medical
   description      TEXT
   permissions      JSONB
   is_system_role   BOOLEAN
   created_at       TIMESTAMP
```

**Default Roles:**
- Head Coach, Assistant Coach, Goalkeeping Coach, Set Pieces Coach
- Player, Captain
- Manager, President
- Physiotherapist, Team Doctor

#### `club_members` (Users belonging to clubs)
```sql
🔑 id              UUID (PK)
🔗 user_id         UUID (FK → users.id)
🔗 club_id         UUID (FK → clubs.id)
🔗 role_id         UUID (FK → club_roles.id)
   jersey_number   INTEGER UNIQUE per club
   position        VARCHAR(50)     -- GK, CB, LB, RB, CDM, CM, etc.
   weekly_salary   DECIMAL(10,2)   -- Optional
   contract_start  DATE
   contract_end    DATE
   is_active       BOOLEAN
   joined_at       TIMESTAMP
   updated_at      TIMESTAMP
```

#### `club_invitations` (Invite system)
```sql
🔑 id                UUID (PK)
🔗 club_id           UUID (FK → clubs.id)
🔗 inviter_id        UUID (FK → users.id)
🔗 role_id           UUID (FK → club_roles.id)
   invitee_email     VARCHAR(255)
   invitation_token  VARCHAR(255) UNIQUE
   message           TEXT
   status            VARCHAR(20)    -- pending, accepted, declined, expired
   expires_at        TIMESTAMP
   created_at        TIMESTAMP
   responded_at      TIMESTAMP
```

---

### 🏃‍♂️ **TRAINING MANAGEMENT**

#### `training_sessions` (Training Sessions)
```sql
🔑 id                  UUID (PK)
🔗 club_id             UUID (FK → clubs.id)
🔗 created_by          UUID (FK → users.id)
   title               VARCHAR(200)
   description         TEXT
   training_type       VARCHAR(50)    -- tactical, physical, technical, friendly_match
   location            VARCHAR(200)
   date                DATE
   start_time          TIME
   end_time            TIME
   is_mandatory        BOOLEAN
   equipment_needed    TEXT[]
   notes               TEXT
   weather_conditions  VARCHAR(100)
   status              VARCHAR(20)    -- scheduled, completed, cancelled
   created_at          TIMESTAMP
   updated_at          TIMESTAMP
```

#### `training_attendance` (Who attended training)
```sql
🔑 id                   UUID (PK)
🔗 training_session_id  UUID (FK → training_sessions.id)
🔗 member_id            UUID (FK → club_members.id)
🔗 recorded_by          UUID (FK → users.id)
   status               VARCHAR(20)   -- pending, present, absent, excused, late
   arrival_time         TIME
   excuse_reason        TEXT
   notes                TEXT
   recorded_at          TIMESTAMP
   created_at           TIMESTAMP
```

#### `training_exercises` (Training drills/exercises)
```sql
🔑 id                   UUID (PK)
🔗 training_session_id  UUID (FK → training_sessions.id)
   exercise_name        VARCHAR(200)
   description          TEXT
   duration_minutes     INTEGER
   intensity_level      INTEGER (1-10)
   equipment_used       TEXT[]
   objectives           TEXT[]
   order_index          INTEGER
   created_at           TIMESTAMP
```

---

### ⚽ **MATCHES & COMPETITIONS**

#### `competitions` (Leagues/Tournaments)
```sql
🔑 id                UUID (PK)
   name              VARCHAR(200)
   season            VARCHAR(20)     -- e.g., "2023/24"
   competition_type  VARCHAR(50)     -- league, cup, friendly
   country           VARCHAR(3)
   division          VARCHAR(100)
   start_date        DATE
   end_date          DATE
   is_active         BOOLEAN
   created_at        TIMESTAMP
```

#### `matches` (Match fixtures and results)
```sql
🔑 id               UUID (PK)
🔗 competition_id   UUID (FK → competitions.id)
🔗 home_club_id     UUID (FK → clubs.id)
🔗 away_club_id     UUID (FK → clubs.id)
   match_date       TIMESTAMP
   venue            VARCHAR(200)
   round            VARCHAR(50)     -- matchday, quarter-final, etc.
   home_score       INTEGER
   away_score       INTEGER
   status           VARCHAR(20)     -- scheduled, live, completed, postponed, cancelled
   referee_name     VARCHAR(100)
   attendance       INTEGER
   notes            TEXT
   created_at       TIMESTAMP
   updated_at       TIMESTAMP
```

#### `match_squads` (Called up players for matches)
```sql
🔑 id             UUID (PK)
🔗 match_id       UUID (FK → matches.id)
🔗 member_id      UUID (FK → club_members.id)
   is_starter     BOOLEAN
   position       VARCHAR(50)
   jersey_number  INTEGER
   status         VARCHAR(20)  -- available, injured, suspended, unavailable
   created_at     TIMESTAMP
```

#### `match_events` (Goals, cards, substitutions)
```sql
🔑 id                UUID (PK)
🔗 match_id          UUID (FK → matches.id)
🔗 member_id         UUID (FK → club_members.id)
🔗 assist_member_id  UUID (FK → club_members.id)
   event_type       VARCHAR(30)  -- goal, yellow_card, red_card, substitution_in, substitution_out
   minute           INTEGER
   description      TEXT
   created_at       TIMESTAMP
```

---

### 💰 **FINANCIAL MANAGEMENT**

#### `financial_categories` (Income/Expense categories)
```sql
🔑 id                  UUID (PK)
   name                VARCHAR(100)
   type                VARCHAR(20)  -- income, expense
   description         TEXT
   is_system_category  BOOLEAN
   created_at          TIMESTAMP
```

**Default Categories:**
- **Expenses:** Player Salaries, Staff Salaries, Equipment, Facility Rental, Travel, Medical, Insurance
- **Income:** Membership Fees, Match Revenue, Sponsorship, Merchandise, Grants, Donations

#### `financial_transactions` (All financial movements)
```sql
🔑 id                   UUID (PK)
🔗 club_id              UUID (FK → clubs.id)
🔗 category_id          UUID (FK → financial_categories.id)
🔗 member_id            UUID (FK → club_members.id) -- For salary payments
🔗 created_by           UUID (FK → users.id)
🔗 approved_by          UUID (FK → users.id)
   description          VARCHAR(500)
   amount               DECIMAL(12,2)
   transaction_type     VARCHAR(20)  -- income, expense
   transaction_date     DATE
   payment_method       VARCHAR(50)  -- cash, bank_transfer, card, check
   reference_number     VARCHAR(100)
   receipt_url          TEXT
   is_recurring         BOOLEAN
   recurring_frequency  VARCHAR(20)  -- weekly, monthly, quarterly, yearly
   next_occurrence      DATE
   status               VARCHAR(20)  -- pending, completed, cancelled
   created_at           TIMESTAMP
   updated_at           TIMESTAMP
```

#### `member_payments` (Player dues, fines, etc.)
```sql
🔑 id             UUID (PK)
🔗 club_id        UUID (FK → clubs.id)
🔗 member_id      UUID (FK → club_members.id)
🔗 created_by     UUID (FK → users.id)
   payment_type   VARCHAR(50)    -- membership_fee, fine, equipment, other
   description    VARCHAR(500)
   amount         DECIMAL(10,2)
   due_date       DATE
   paid_date      DATE
   payment_method VARCHAR(50)
   status         VARCHAR(20)    -- pending, paid, overdue, waived
   created_at     TIMESTAMP
   updated_at     TIMESTAMP
```

---

### 📢 **COMMUNICATIONS**

#### `announcements` (Club announcements)
```sql
🔑 id               UUID (PK)
🔗 club_id          UUID (FK → clubs.id)
🔗 created_by       UUID (FK → users.id)
   title            VARCHAR(200)
   content          TEXT
   priority         VARCHAR(20)  -- low, normal, high, urgent
   target_audience  VARCHAR(50)  -- all, players, coaching_staff, management
   is_pinned        BOOLEAN
   expires_at       TIMESTAMP
   created_at       TIMESTAMP
   updated_at       TIMESTAMP
```

#### `notifications` (Personal notifications)
```sql
🔑 id         UUID (PK)
🔗 user_id    UUID (FK → users.id)
🔗 club_id    UUID (FK → clubs.id)
   type       VARCHAR(50)   -- training_reminder, match_callup, payment_due, announcement
   title      VARCHAR(200)
   message    TEXT
   data       JSONB         -- Additional data
   is_read    BOOLEAN
   created_at TIMESTAMP
```

---

### 📊 **STATISTICS & PERFORMANCE**

#### `player_statistics` (Individual player stats)
```sql
🔑 id                        UUID (PK)
🔗 member_id                 UUID (FK → club_members.id)
   season                    VARCHAR(20)
   matches_played            INTEGER
   matches_started           INTEGER
   minutes_played            INTEGER
   goals                     INTEGER
   assists                   INTEGER
   yellow_cards              INTEGER
   red_cards                 INTEGER
   clean_sheets              INTEGER  -- For goalkeepers
   saves                     INTEGER  -- For goalkeepers
   training_attendance_rate  DECIMAL(5,2)  -- Percentage
   created_at                TIMESTAMP
   updated_at                TIMESTAMP
```

#### `club_statistics` (Team performance stats)
```sql
🔑 id               UUID (PK)
🔗 club_id          UUID (FK → clubs.id)
🔗 competition_id   UUID (FK → competitions.id)
   season           VARCHAR(20)
   matches_played   INTEGER
   wins             INTEGER
   draws            INTEGER
   losses           INTEGER
   goals_for        INTEGER
   goals_against    INTEGER
   points           INTEGER
   position         INTEGER
   created_at       TIMESTAMP
   updated_at       TIMESTAMP
```

---

### 🏥 **MEDICAL & INJURY TRACKING**

#### `medical_records` (Player health records)
```sql
🔑 id                     UUID (PK)
🔗 member_id              UUID (FK → club_members.id)
🔗 created_by             UUID (FK → users.id)
   record_type            VARCHAR(50)   -- injury, illness, medical_check, treatment
   title                  VARCHAR(200)
   description            TEXT
   severity               VARCHAR(20)   -- minor, moderate, severe
   body_part              VARCHAR(50)
   injury_date            DATE
   expected_recovery_date DATE
   actual_recovery_date   DATE
   treatment_plan         TEXT
   medical_professional   VARCHAR(100)
   status                 VARCHAR(20)   -- active, recovered, chronic
   confidential           BOOLEAN
   created_at             TIMESTAMP
   updated_at             TIMESTAMP
```

---

## 🔗 Key Relationships

### Primary Relationships:
- **users** ↔ **club_members** ↔ **clubs** (Many-to-Many through club_members)
- **club_members** → **club_roles** (Many-to-One)
- **clubs** → **training_sessions** (One-to-Many)
- **training_sessions** ↔ **club_members** via **training_attendance** (Many-to-Many)
- **clubs** ↔ **matches** (Many-to-Many as home/away teams)
- **matches** ↔ **club_members** via **match_squads** (Many-to-Many)

### Financial Relationships:
- **clubs** → **financial_transactions** (One-to-Many)
- **financial_categories** → **financial_transactions** (One-to-Many)
- **club_members** → **member_payments** (One-to-Many)

### Statistical Relationships:
- **club_members** → **player_statistics** (One-to-Many by season)
- **clubs** → **club_statistics** (One-to-Many by season/competition)
- **club_members** → **medical_records** (One-to-Many)

---

## 🎯 Key Features Supported

✅ **Multi-role Management**: Head Coach, Assistant Coach, Players, etc.
✅ **Comprehensive Training**: Sessions, attendance, exercises
✅ **Match Management**: Fixtures, squads, events, statistics
✅ **Financial Tracking**: Income, expenses, salaries, member payments
✅ **Communication**: Announcements, notifications
✅ **Performance Analytics**: Player and club statistics
✅ **Medical Tracking**: Injuries, treatments, recovery
✅ **Flexible Subscriptions**: Free, basic, premium plans
✅ **Audit Trail**: Created/updated timestamps on all key tables
✅ **Scalability**: UUID primary keys, proper indexing

---

## 📈 Monetization Features

- **Subscription Plans**: Free (basic), Premium (advanced features)
- **Club Limits**: Different limits based on subscription level
- **Feature Gating**: Advanced analytics, detailed reports for premium
- **Sponsor Integration**: Sponsorship tracking and revenue management