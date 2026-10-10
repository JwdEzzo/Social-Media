-- =====================================================================================
-- Seed data for the Instagram clone (database: instagram)
--
--   100 users, 100 posts, 100 comments, plus ~1200 follows between the seeded users
--   (each user follows 12 others, so follower/following lists span more than one page)
--
-- How to run: pgAdmin > Query Tool on the "instagram" database > open this file > F5
--
-- Every seeded user:
--   username  e.g. olivia_0001, liam_0002, ... (all >= 8 chars, as AppUser requires)
--   email     <username>@seed.dev   <- this is how the seed rows are identified later
--   password  password123
--
-- Runs in a single transaction: if any statement fails, nothing is written.
-- To remove the seed data again, see the UNDO block at the bottom of this file.
-- =====================================================================================

BEGIN;

-- crypt()/gen_salt() produce $2a$ BCrypt hashes, which Spring's BCryptPasswordEncoder accepts
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- -------------------------------------------------------------------------------------
-- 1. Users (100)
-- -------------------------------------------------------------------------------------
WITH
  -- Hash once and reuse it: cost 12 matches SecurityConfig, and 100 separate hashes would take ~30s
  pw AS (
    SELECT crypt('password123', gen_salt('bf', 12)) AS hash
  ),
  words AS (
    SELECT
      ARRAY['olivia', 'liam', 'emma', 'noah', 'ava', 'elijah', 'sophia', 'lucas', 'mia', 'mason',
            'amelia', 'ethan', 'harper', 'logan', 'evelyn', 'james', 'layla', 'omar', 'zara', 'yusuf'] AS first_names,
      ARRAY['Coffee first, then everything else ☕',
            'Chasing sunsets and good vibes 🌅',
            'Photographer | Traveler | Dreamer',
            'Living one adventure at a time ✈️',
            'Foodie with a camera 🍜',
            'Just here for the memes',
            'Software engineer by day, gamer by night 🎮',
            'Dog parent 🐶',
            'Fitness • Nutrition • Discipline 💪',
            'Bookworm 📚 and tea lover',
            'Making art out of everyday moments',
            'Music is life 🎧',
            'Plant collector 🌿',
            'Beach > mountains 🏖️',
            'Exploring the world one city at a time'] AS bios
  )
INSERT INTO app_users (username, email, password, bio_text, profile_picture_url, account_status, created_at, updated_at)
SELECT
  u.username,
  u.username || '@seed.dev',
  pw.hash,
  words.bios[1 + (g % array_length(words.bios, 1))],
  'https://i.pravatar.cc/300?img=' || (1 + (g % 70)),        -- pravatar has 70 faces
  CASE WHEN g % 10 = 0 THEN 'PRIVATE' ELSE 'PUBLIC' END,     -- every 10th account is private
  u.joined,
  u.joined
FROM generate_series(1, 100) AS g
CROSS JOIN pw
CROSS JOIN words
CROSS JOIN LATERAL (
  SELECT
    words.first_names[1 + (g % array_length(words.first_names, 1))] || '_' || lpad(g::text, 4, '0') AS username,
    localtimestamp - random() * interval '365 days' AS joined      -- joined some time in the last year
) AS u
ON CONFLICT DO NOTHING;                                             -- skip users that already exist


-- -------------------------------------------------------------------------------------
-- 2. Posts (100), each owned by a random seeded user and created after that user joined
-- -------------------------------------------------------------------------------------
WITH
  seed_users AS (
    SELECT id, created_at, row_number() OVER (ORDER BY id) AS rn
    FROM app_users
    WHERE email LIKE '%@seed.dev'
  ),
  -- random() in its own CTE so it runs once per post (volatile CTEs aren't inlined)
  picks AS (
    SELECT g,
           1 + floor(random() * (SELECT count(*) FROM seed_users))::int AS user_rn,
           random() AS r
    FROM generate_series(1, 100) AS g
  ),
  captions AS (
    SELECT ARRAY['Golden hour never disappoints ✨ #sunset #goldenhour',
                 'Weekend mood 😎 #weekend #chill',
                 'New city, new stories 🌍 #travel #wanderlust',
                 'Brunch goals 🥞 #foodie #brunch',
                 'Throwback to this beautiful day #tbt',
                 'Nature therapy 🌲 #hiking #outdoors',
                 'Coffee and code ☕💻 #developer #coding',
                 'Small moments, big memories ❤️',
                 'Can''t get enough of this view 🏔️ #mountains',
                 'Sunday reset 🧘 #selfcare',
                 'Late night city lights 🌃 #citylife',
                 'Homemade pasta tonight 🍝 #cooking',
                 'Beach days are the best days 🌊 #summer',
                 'Gym done ✅ #fitness #motivation',
                 'Exploring hidden gems 💎 #explore',
                 'My little buddy 🐾 #dogsofinstagram',
                 'Rainy day reads 📖 #books',
                 'Concert night was unreal 🎶 #livemusic',
                 'Fresh flowers for a fresh start 🌸',
                 'Road trip vibes 🚗 #roadtrip',
                 'Sketching in the park 🎨 #art',
                 'Snow day! ❄️ #winter',
                 'Street food heaven 🌮 #streetfood',
                 'Sunrise run 🏃 #morningroutine',
                 'Grateful for days like this 🙏'] AS c
  )
INSERT INTO posts (description, image_url, app_user_id, created_at, updated_at)
SELECT
  captions.c[1 + floor(random() * array_length(captions.c, 1))::int],
  'https://picsum.photos/seed/seedpost' || p.g || '/1080/1080',     -- a stable random photo per post
  u.id,
  u.created_at + p.r * (localtimestamp - u.created_at),
  u.created_at + p.r * (localtimestamp - u.created_at)
FROM picks AS p
JOIN seed_users AS u ON u.rn = p.user_rn
CROSS JOIN captions;


-- -------------------------------------------------------------------------------------
-- 3. Comments (100), a random seeded user on a random seeded post, after both existed
-- -------------------------------------------------------------------------------------
WITH
  seed_users AS (
    SELECT id, created_at, row_number() OVER (ORDER BY id) AS rn
    FROM app_users
    WHERE email LIKE '%@seed.dev'
  ),
  seed_posts AS (
    SELECT p.id, p.created_at, row_number() OVER (ORDER BY p.id) AS rn
    FROM posts AS p
    JOIN app_users AS u ON u.id = p.app_user_id
    WHERE u.email LIKE '%@seed.dev'
  ),
  picks AS (
    SELECT g,
           1 + floor(random() * (SELECT count(*) FROM seed_posts))::int AS post_rn,
           1 + floor(random() * (SELECT count(*) FROM seed_users))::int AS user_rn,
           random() AS r
    FROM generate_series(1, 100) AS g
  ),
  texts AS (
    SELECT ARRAY['Wow, this is amazing! 😍',
                 'Love this so much ❤️',
                 'Where is this? I need to go!',
                 'Stunning shot 📸',
                 'This made my day 😂',
                 'Goals!! 🙌',
                 'So jealous right now',
                 'Beautiful colors 🎨',
                 'Looks delicious 🤤',
                 'Great vibes 🔥',
                 'Miss you! Let''s catch up soon',
                 'Absolutely incredible 👏',
                 'Need this energy today 💯',
                 'How did you take this?',
                 'Iconic.',
                 'This is so peaceful 🌿',
                 'Take me with you next time!',
                 'Obsessed with this 😍',
                 'Can''t stop looking at this',
                 'Perfection ✨'] AS t
  )
INSERT INTO comment (content, app_user_id, post_id, created_at)
SELECT
  texts.t[1 + floor(random() * array_length(texts.t, 1))::int],
  u.id,
  p.id,
  greatest(p.created_at, u.created_at) + pk.r * (localtimestamp - greatest(p.created_at, u.created_at))
FROM picks AS pk
JOIN seed_posts AS p ON p.rn = pk.post_rn
JOIN seed_users AS u ON u.rn = pk.user_rn
CROSS JOIN texts;


-- -------------------------------------------------------------------------------------
-- 4. Follows: every seeded user follows 12 random other seeded users (~1200 rows)
--    Fills the "Following" feed and gives follower lists a second page (page size is 10)
-- -------------------------------------------------------------------------------------
WITH seed_users AS (
  SELECT id, created_at
  FROM app_users
  WHERE email LIKE '%@seed.dev'
)
INSERT INTO follows (follower_id, following_id, followed_at)
SELECT
  f.id,
  t.id,
  greatest(f.created_at, t.created_at) + random() * (localtimestamp - greatest(f.created_at, t.created_at))
FROM seed_users AS f
CROSS JOIN LATERAL (
  -- references f.id, so it re-runs (and re-shuffles) for every follower
  SELECT s.id, s.created_at
  FROM seed_users AS s
  WHERE s.id <> f.id
  ORDER BY random()
  LIMIT 12
) AS t
ON CONFLICT DO NOTHING;                                             -- unique (follower_id, following_id)


-- -------------------------------------------------------------------------------------
-- Summary of what's now in the database from the seed
-- -------------------------------------------------------------------------------------
SELECT 'seed users' AS what, count(*) AS total FROM app_users WHERE email LIKE '%@seed.dev'
UNION ALL
SELECT 'seed posts', count(*) FROM posts WHERE app_user_id IN (SELECT id FROM app_users WHERE email LIKE '%@seed.dev')
UNION ALL
SELECT 'seed comments', count(*) FROM comment WHERE app_user_id IN (SELECT id FROM app_users WHERE email LIKE '%@seed.dev')
UNION ALL
SELECT 'seed follows', count(*) FROM follows WHERE follower_id IN (SELECT id FROM app_users WHERE email LIKE '%@seed.dev');

COMMIT;


/* =====================================================================================
   UNDO: delete all seed data, plus anything that references it (likes, saves, replies,
   notifications, ... created while using the app as a seed user or on a seed post).
   Select everything from BEGIN to COMMIT below and run it (F5 runs only the selection).
   =====================================================================================

BEGIN;

CREATE TEMP TABLE seed_u ON COMMIT DROP AS
  SELECT id FROM app_users WHERE email LIKE '%@seed.dev';
CREATE TEMP TABLE seed_p ON COMMIT DROP AS
  SELECT id FROM posts WHERE app_user_id IN (SELECT id FROM seed_u);
CREATE TEMP TABLE seed_c ON COMMIT DROP AS
  SELECT id FROM comment
  WHERE app_user_id IN (SELECT id FROM seed_u) OR post_id IN (SELECT id FROM seed_p);
CREATE TEMP TABLE seed_r ON COMMIT DROP AS
  SELECT id FROM comment_reply
  WHERE app_user_id IN (SELECT id FROM seed_u) OR comment_id IN (SELECT id FROM seed_c);

-- children before parents, to satisfy the foreign keys
DELETE FROM comment_reply_likes WHERE app_user_id IN (SELECT id FROM seed_u) OR comment_reply_id IN (SELECT id FROM seed_r);
DELETE FROM comment_likes       WHERE app_user_id IN (SELECT id FROM seed_u) OR comment_id       IN (SELECT id FROM seed_c);
DELETE FROM comment_reply       WHERE id IN (SELECT id FROM seed_r);
DELETE FROM comment             WHERE id IN (SELECT id FROM seed_c);
DELETE FROM post_likes          WHERE app_user_id IN (SELECT id FROM seed_u) OR post_id IN (SELECT id FROM seed_p);
DELETE FROM post_saves          WHERE app_user_id IN (SELECT id FROM seed_u) OR post_id IN (SELECT id FROM seed_p);
DELETE FROM posts               WHERE id IN (SELECT id FROM seed_p);
DELETE FROM follows             WHERE follower_id IN (SELECT id FROM seed_u) OR following_id IN (SELECT id FROM seed_u);
DELETE FROM follow_requests     WHERE requester_user_id IN (SELECT id FROM seed_u) OR receiver_user_id IN (SELECT id FROM seed_u);
DELETE FROM notification        WHERE sender_id IN (SELECT id FROM seed_u) OR recipient_id IN (SELECT id FROM seed_u);
DELETE FROM profile_pictures    WHERE app_user_id IN (SELECT id FROM seed_u);
DELETE FROM app_users           WHERE id IN (SELECT id FROM seed_u);

COMMIT;

*/
