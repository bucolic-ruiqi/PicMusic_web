-- 三表最小示例（MySQL 8+）
-- 字符集：utf8mb4（完整 Unicode）

CREATE DATABASE IF NOT EXISTS mywebapp
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE mywebapp;

-- 1) users 表
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 与数据集字段对齐：ID,name,artist,style,language,BPM,instrument,lyrics,label,emotion_json,dominant_emotion
-- 说明：ID 可能超 32 位，使用 BIGINT；ID 来自 CSV，无 AUTO_INCREMENT
CREATE TABLE IF NOT EXISTS tracks (
  id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  style TEXT NULL,
  language VARCHAR(64) NULL,
  bpm INT NULL,
  instrument TEXT NULL,
  lyrics LONGTEXT NULL,
  label VARCHAR(128) NULL,
  emotion_json JSON NULL,
  dominant_emotion VARCHAR(32) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_tracks_name_artist (name, artist)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) diaries 表
-- 简化：多首歌以 track_ids_json(JSON) 存储；仅需单曲可改为 track_id + 外键
CREATE TABLE IF NOT EXISTS diaries (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  diary_datetime DATETIME NOT NULL,
  trip_start DATETIME NULL,
  trip_end DATETIME NULL,
  location VARCHAR(200) NULL,
  mood VARCHAR(30) NULL,
  content TEXT NULL,
  photo_urls_json JSON NULL,
  track_ids_json JSON NULL,
  is_favorite TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_diaries_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_diaries_tracks_json CHECK (track_ids_json IS NULL OR JSON_VALID(track_ids_json)),
  CONSTRAINT chk_diaries_photos_json CHECK (photo_urls_json IS NULL OR JSON_VALID(photo_urls_json)),
  INDEX idx_diaries_user_datetime (user_id, diary_datetime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
