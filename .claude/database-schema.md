# Database Schema

## Overview
This microSaaS application uses Supabase (PostgreSQL) as its database. All migrations are stored in `/supabase/migrations/` and should be run in sequential order.

## Schema Design

### Core Tables

#### `organizations`
Top-level entity that owns all application data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique organization identifier |
| name | TEXT | NOT NULL | Organization name |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record update timestamp |

**Features:**
- Row Level Security (RLS) enabled
- Auto-updating `updated_at` trigger

---

#### `users`
Application users linked to Supabase Auth and belonging to one organization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE | Links to Supabase auth user |
| organization_id | UUID | NOT NULL, REFERENCES organizations(id) ON DELETE CASCADE | Organization membership |
| email | TEXT | NOT NULL, UNIQUE | User email address |
| full_name | TEXT | NULLABLE | User's full name |
| role | user_role | NOT NULL, DEFAULT 'user' | User role in organization |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record update timestamp |

**Indexes:**
- `idx_users_organization_id` on `organization_id`
- `idx_users_email` on `email`

**Features:**
- Row Level Security (RLS) enabled
- Auto-updating `updated_at` trigger
- Cascading deletes when auth user or organization is deleted

---

### Enums

#### `user_role`
Defines user permission levels within an organization.

**Values:**
- `admin` - Full access to organization features and resources
- `user` - Standard access to application features

---

## Relationships

```
organizations (1) ──< (many) users
       │
       └──< (many) [your application data models]

users (1) ──< (many) [your application data models]
```

### Key Relationship Rules

1. **User → Organization**: Each user belongs to exactly one organization
2. **Cascading Deletes**:
   - Deleting an organization removes all associated users
   - Deleting a Supabase auth user removes the corresponding user record
3. **Organization Scope**: Add your application-specific data models that belong to organizations

---

## Row Level Security (RLS)

Both `organizations` and `users` tables have RLS enabled. Policies should be implemented to:

1. Allow users to read their own organization data
2. Allow users to read other users in their organization
3. Allow admins to manage users in their organization
4. Restrict cross-organization data access

**Note:** RLS policies need to be implemented in future migrations.

---

## Migrations

### Existing Migrations

1. **20250930000001_create_organizations.sql**
   - Creates `organizations` table
   - Adds `update_updated_at_column()` function
   - Enables RLS

2. **20250930000002_create_users.sql**
   - Creates `user_role` enum
   - Creates `users` table with foreign keys
   - Adds indexes for performance
   - Enables RLS

### Running Migrations

```bash
# Using Supabase CLI
supabase db push

# Or through Supabase Dashboard
# SQL Editor → paste migration content → Run
```

---

## Future Schema Additions

### Application-Specific Tables

Add your application-specific tables here following the multi-tenant pattern:

1. **Organization-scoped resources**
   - Tables that contain data shared across the organization
   - Should have `organization_id` foreign key
   - Admins can manage, users can use

2. **User-scoped resources**
   - Tables that contain user-specific data
   - Should have `user_id` foreign key
   - Users own their data, admins can view all

3. **`teams`** (optional future feature)
   - Sub-groups within organizations
   - Many-to-many relationship with users

---

## Notes for Development

- Always use transactions for multi-table operations
- Leverage indexes for frequently queried fields
- Keep RLS policies tight to prevent data leaks
- Use the `update_updated_at_column()` trigger for all tables needing audit trails
- Foreign keys use CASCADE deletes to maintain referential integrity
