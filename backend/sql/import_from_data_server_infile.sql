-- 服务端导入（NO LOCAL），使用 secure_file_priv 目录
-- 适用于无法开启 LOCAL INFILE 的场景
-- 步骤：
-- 1) 查看目录：SELECT @@secure_file_priv;
-- 2) 将 CSV 复制到该目录（如 /var/lib/mysql-files/）
-- 3) 修改下方路径 @dir 为实际目录
-- 4) 运行：mysql -u root -p < backend/sql/import_from_data_server_infile.sql

USE mywebapp;

-- 可选清理
-- SET FOREIGN_KEY_CHECKS=0;
-- TRUNCATE TABLE diaries;
-- TRUNCATE TABLE tracks;
-- TRUNCATE TABLE users;
-- SET FOREIGN_KEY_CHECKS=1;

-- 将此路径替换为上一步查询结果
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

-- tracks.csv（注意 ID/BPM 表头）
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

-- diaries.csv（与前端示例一致表头）
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
