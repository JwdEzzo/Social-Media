-- Split uploaded profile-picture bytes out of app_users into profile_pictures.
--
-- STOP THE APP BEFORE RUNNING THIS.
-- ddl-auto=update has already added app_user_id, a unique constraint and a FK
-- to profile_pictures on an earlier boot. It cannot convert image_data from oid
-- to bytea, drop the old app_users columns, or add ON DELETE CASCADE — that is
-- what this script is for. Every step is guarded, so it is safe to re-run.
--
--   psql -h localhost -U jwd -d instagram -f V1__split_profile_pictures.sql

BEGIN;

-- 1. profile_picture_url stays on app_users, where the hot path reads it.
ALTER TABLE profile_pictures DROP COLUMN IF EXISTS profile_picture_url;

-- 2. Convert image_data from oid to bytea. The table is empty, so there is
--    nothing to preserve — drop and re-add rather than cast.
ALTER TABLE profile_pictures DROP COLUMN IF EXISTS image_data;
ALTER TABLE profile_pictures ADD COLUMN image_data BYTEA;

-- 3. Hibernate already created this one; the guard is for a fresh database.
ALTER TABLE profile_pictures ADD COLUMN IF NOT EXISTS app_user_id BIGINT;

-- 4. Move the bytes across. lo_get() materialises the large object into real
--    bytea, so the new rows do not alias pg_largeobject entries the way a bare
--    oid copy would. Rows whose large object has already gone missing are
--    skipped rather than aborting the whole migration — step 8 reports them.
INSERT INTO profile_pictures (app_user_id, image_data, image_name, image_type, image_size)
SELECT u.id, lo_get(u.image_data), u.image_name, u.image_type, u.image_size
FROM app_users u
WHERE u.image_data IS NOT NULL
  AND EXISTS (SELECT 1 FROM pg_largeobject lo WHERE lo.loid = u.image_data)
  AND NOT EXISTS (SELECT 1 FROM profile_pictures p WHERE p.app_user_id = u.id);

-- 5. Release the old large objects. Dropping the oid column alone would strand
--    the bytes in pg_largeobject permanently.
SELECT lo_unlink(u.image_data)
FROM app_users u
WHERE u.image_data IS NOT NULL
  AND EXISTS (SELECT 1 FROM pg_largeobject lo WHERE lo.loid = u.image_data);

-- 6. Constraints the entity mapping expects.
ALTER TABLE profile_pictures ALTER COLUMN app_user_id SET NOT NULL;
ALTER TABLE profile_pictures ALTER COLUMN image_data SET NOT NULL;

DO $$
BEGIN
   IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'uk_profile_pictures_app_user'
   ) AND NOT EXISTS (
      SELECT 1 FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      WHERE rel.relname = 'profile_pictures' AND con.contype = 'u'
   ) THEN
      ALTER TABLE profile_pictures
         ADD CONSTRAINT uk_profile_pictures_app_user UNIQUE (app_user_id);
   END IF;
END $$;

-- 7. Replace Hibernate's generated FK with one that cascades, so this does not
--    become one more table blocking user deletion. The generated name differs
--    per database, so find it rather than hardcoding it.
DO $$
DECLARE
   existing_fk text;
BEGIN
   SELECT con.conname INTO existing_fk
   FROM pg_constraint con
   JOIN pg_class rel ON rel.oid = con.conrelid
   WHERE rel.relname = 'profile_pictures'
     AND con.contype = 'f'
     AND con.conkey = ARRAY[(
        SELECT attnum FROM pg_attribute
        WHERE attrelid = rel.oid AND attname = 'app_user_id'
     )]::smallint[];

   IF existing_fk IS NOT NULL THEN
      EXECUTE format('ALTER TABLE profile_pictures DROP CONSTRAINT %I', existing_fk);
   END IF;

   ALTER TABLE profile_pictures
      ADD CONSTRAINT fk_profile_pictures_app_user
      FOREIGN KEY (app_user_id) REFERENCES app_users (id) ON DELETE CASCADE;
END $$;

-- 8. Report anything left behind BEFORE the columns disappear: a user with
--    image_data set but no new row means their large object was already gone.
DO $$
DECLARE
   stranded int;
BEGIN
   SELECT count(*) INTO stranded
   FROM app_users u
   WHERE u.image_data IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM profile_pictures p WHERE p.app_user_id = u.id);

   IF stranded > 0 THEN
      RAISE WARNING '% user(s) had image_data pointing at a missing large object; their avatars will fall back to profile_picture_url', stranded;
   END IF;
END $$;

-- 9. Drop the migrated columns from app_users.
ALTER TABLE app_users
   DROP COLUMN IF EXISTS image_data,
   DROP COLUMN IF EXISTS image_name,
   DROP COLUMN IF EXISTS image_type,
   DROP COLUMN IF EXISTS image_size;

COMMIT;

-- Expected: 3 rows (admin123 png, admin456 jpeg, admin111 jpeg), non-zero bytes.
SELECT p.app_user_id, u.username, octet_length(p.image_data) AS bytes, p.image_type
FROM profile_pictures p
JOIN app_users u ON u.id = p.app_user_id
ORDER BY p.app_user_id;
