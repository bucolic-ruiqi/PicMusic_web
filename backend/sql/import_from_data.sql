-- 一键导入 backend/data/*.csv 至 mywebapp（MySQL 8+, utf8mb4）
-- 提示：使用 LOCAL 变体需开启 LOCAL INFILE
-- 建议启动方式：mysql --local-infile=1 -u root -p

USE mywebapp;

-- 可选：导入前清空（注意外键顺序）
-- SET FOREIGN_KEY_CHECKS=0;
-- TRUNCATE TABLE diaries;
-- TRUNCATE TABLE tracks;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS=1;

-- 1) users.csv -> users
-- 表头：id,username,email,password_hash,created_at
-- 如需按主键覆盖可改为 REPLACE；纯插入使用 INTO
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
-- 表头（注意 ID/BPM 大写）：ID,name,artist,style,language,BPM,instrument,lyrics,label,emotion_json,dominant_emotion
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
-- 表头（与前端示例一致）：id,user_id,date,startDate,endDate,location,mood,text,photos,track_ids_json,is_favorite,created_at,updated_at
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
  photo_urls_json = NULLIF(@photos,''), -- 需为合法 JSON（由 CHECK 保证）
  track_ids_json = NULLIF(@track_ids_json,''),  -- 需为合法 JSON（由 CHECK 保证）
  is_favorite = IFNULL(NULLIF(@is_favorite,''), 0),
  created_at = NULLIF(@created_at,''),
  updated_at = NULLIF(@updated_at,'');
