-- Server-side CSV import (NO LOCAL) using secure_file_priv directory
-- Use this when you cannot enable LOCAL INFILE on the server.
-- Steps:
-- 1) Find secure_file_priv directory:
--    SELECT @@secure_file_priv;
-- 2) Copy CSV files into that directory (example: /var/lib/mysql-files/):
--    cp /Users/ruiqi/mywebapp/backend/data/users.csv /var/lib/mysql-files/
--    cp /Users/ruiqi/mywebapp/backend/data/tracks.csv /var/lib/mysql-files/
--    cp /Users/ruiqi/mywebapp/backend/data/diaries.csv /var/lib/mysql-files/
-- 3) Adjust the file paths below to your secure_file_priv actual value.
-- 4) Run: mysql -u root -p < backend/sql/import_from_data_server_infile.sql

USE mywebapp;

-- Optional clean
-- SET FOREIGN_KEY_CHECKS=0;
-- TRUNCATE TABLE diaries;
-- TRUNCATE TABLE tracks;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS=1;

-- Replace this path with the result of SELECT @@secure_file_priv;
SET @dir = '/var/lib/mysql-files/';

-- users.csv
LOAD DATA INFILE CONCAT(@dir, 'users.csv')
INTO TABLE users
FIELDS TERMINATED BY ',' ENCLOSED BY '"' ESCAPED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(@id,@username,@email,@password_hash,@created_at)
SET
  id = NULLIF(@id,''),
  username = NULLIF(@username,''),
  email = NULLIF(@email,''),
  password_hash = NULLIF(@password_hash,''),
  created_at = NULLIF(@created_at,'');

-- tracks.csv (note headers ID/BPM)
LOAD DATA INFILE CONCAT(@dir, 'tracks.csv')
INTO TABLE tracks
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ',' ENCLOSED BY '"' ESCAPED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(@ID,@name,@artist,@style,@language,@BPM,@instrument,@lyrics,@label,@emotion_json,@dominant_emotion)
SET 
  id = NULLIF(@ID,''),
  name = NULLIF(@name,''),
  artist = NULLIF(@artist,''),
  style = NULLIF(@style,''),
  language = NULLIF(@language,''),
  bpm = NULLIF(@BPM,''),
  instrument = NULLIF(@instrument,''),
  lyrics = NULLIF(@lyrics,''),
  label = NULLIF(@label,''),
  emotion_json = NULLIF(@emotion_json,''),
  dominant_emotion = NULLIF(@dominant_emotion,'');

-- diaries.csv (frontend-aligned headers)
LOAD DATA INFILE CONCAT(@dir, 'diaries.csv')
INTO TABLE diaries
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ',' ENCLOSED BY '"' ESCAPED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(@id,@user_id,@date,@startDate,@endDate,@location,@mood,@text,@photos,@track_ids_json,@is_favorite,@created_at,@updated_at)
SET
  id = NULLIF(@id,''),
  user_id = NULLIF(@user_id,''),
  diary_datetime = NULLIF(@date,''),
  trip_start = NULLIF(@startDate,''),
  trip_end = NULLIF(@endDate,''),
  location = NULLIF(@location,''),
  mood = NULLIF(@mood,''),
  content = NULLIF(@text,''),
  photo_urls_json = NULLIF(@photos,''),
  track_ids_json = NULLIF(@track_ids_json,''),
  is_favorite = IFNULL(NULLIF(@is_favorite,''), 0),
  created_at = NULLIF(@created_at,''),
  updated_at = NULLIF(@updated_at,'');
