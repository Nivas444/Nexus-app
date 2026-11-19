-- =============================================================================
-- Nexus ERP - Supabase PostgreSQL Security & Row Level Security (RLS) Policies
-- =============================================================================
-- Architecture:
--   Frontend (Vercel) -> FastAPI Backend (Render, JWT + RBAC) -> Supabase PostgreSQL
--
-- Security Model:
--   1. All privileged ERP operations execute exclusively through FastAPI.
--   2. Direct PostgREST / client API access via `anon` or `authenticated` roles
--      is blocked on all 7 `nexus_*` schemas (default-deny RLS + revoked grants).
--   3. Preserves all 7 schemas and all existing tables/data untouched:
--        nexus_accounts, nexus_admin, nexus_infra_inventory,
--        nexus_inventory, nexus_master, nexus_project, nexus_purchase
--   4. Safe and idempotent to re-run at any time.
-- =============================================================================

DO $$
DECLARE
    target_schemas TEXT[] := ARRAY[
        'nexus_accounts',
        'nexus_admin',
        'nexus_infra_inventory',
        'nexus_inventory',
        'nexus_master',
        'nexus_project',
        'nexus_purchase'
    ];
    sch TEXT;
    tbl RECORD;
    has_anon BOOLEAN;
    has_authenticated BOOLEAN;
BEGIN
    SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') INTO has_anon;
    SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') INTO has_authenticated;

    FOREACH sch IN ARRAY target_schemas LOOP
        IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = sch) THEN
            -- 1. Revoke direct schema & table privileges from public/PostgREST client roles
            IF has_anon THEN
                EXECUTE format('REVOKE ALL ON SCHEMA %I FROM anon;', sch);
                EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA %I FROM anon;', sch);
                EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA %I FROM anon;', sch);
                EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I REVOKE ALL ON TABLES FROM anon;', sch);
            END IF;

            IF has_authenticated THEN
                EXECUTE format('REVOKE ALL ON SCHEMA %I FROM authenticated;', sch);
                EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA %I FROM authenticated;', sch);
                EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA %I FROM authenticated;', sch);
                EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I REVOKE ALL ON TABLES FROM authenticated;', sch);
            END IF;

            -- 2. Enable Row Level Security (default-deny for non-owner/non-bypassrls roles)
            --    Note: FastAPI connects via backend PostgreSQL role (owner/service_role),
            --    where authorization is enforced centrally by FastAPI JWT + RBAC.
            FOR tbl IN
                SELECT tablename
                FROM pg_tables
                WHERE schemaname = sch
            LOOP
                EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY;', sch, tbl.tablename);
            END LOOP;
        END IF;
    END LOOP;
END
$$;

-- Explicit verification query (returns schema, table count, and RLS-enabled count)
SELECT
    n.nspname AS schema_name,
    COUNT(*) AS total_tables,
    COUNT(*) FILTER (WHERE c.relrowsecurity) AS rls_enabled_tables
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
  AND n.nspname IN (
      'nexus_accounts',
      'nexus_admin',
      'nexus_infra_inventory',
      'nexus_inventory',
      'nexus_master',
      'nexus_project',
      'nexus_purchase'
  )
GROUP BY n.nspname
ORDER BY n.nspname;
