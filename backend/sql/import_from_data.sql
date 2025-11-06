-- One-click CSV import from backend/data into mywebapp schema
-- MySQL 8+, utf8mb4. Enable LOCAL INFILE when using LOCAL variants.
-- Tip: start a session with: mysql --local-infile=1 -u root -p

USE mywebapp;

-- Optional: clean tables before import (respect FK order)
-- SET FOREIGN_KEY_CHECKS=0;
-- TRUNCATE TABLE diaries;
-- TRUNCATE TABLE tracks;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS=1;

-- 1) users.csv -> users
-- Header: id,username,email,password_hash,created_at
-- Use REPLACE to upsert by PRIMARY KEY(id) if needed. Switch to "INTO" to do pure inserts.
LOAD DATA LOCAL INFILE '/Users/ruiqi/mywebapp/backend/data/users.csv'
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

-- 2) tracks.csv -> tracks
-- Header (note the capitalized ID/BPM): ID,name,artist,style,language,BPM,instrument,lyrics,label,emotion_json,dominant_emotion
LOAD DATA LOCAL INFILE '/Users/ruiqi/mywebapp/backend/data/tracks.csv'
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

-- 3) diaries.csv -> diaries
-- Header (aligned to frontend examples): id,user_id,date,startDate,endDate,location,mood,text,photos,track_ids_json,is_favorite,created_at,updated_at
LOAD DATA LOCAL INFILE '/Users/ruiqi/mywebapp/backend/data/diaries.csv'
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
  photo_urls_json = NULLIF(@photos,''), -- must be valid JSON per CHECK
  track_ids_json = NULLIF(@track_ids_json,''),  -- must be valid JSON per CHECK
  is_favorite = IFNULL(NULLIF(@is_favorite,''), 0),
  created_at = NULLIF(@created_at,''),
  updated_at = NULLIF(@updated_at,'');
