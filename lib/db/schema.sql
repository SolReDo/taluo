-- 塔罗牌小程序数据库 Schema
-- MySQL 8.0+

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY COMMENT '用户UUID (游客与正式用户统一格式)',
    `openid` VARCHAR(64) DEFAULT NULL UNIQUE COMMENT '微信 OpenID (游客阶段为 NULL)',
    `username` VARCHAR(50) DEFAULT NULL UNIQUE COMMENT '用户名 (注册用户)',
    `password_hash` VARCHAR(255) DEFAULT NULL COMMENT '密码哈希 (bcrypt)',
    `nickname` VARCHAR(50) DEFAULT '塔罗寻梦人',
    `avatar_url` VARCHAR(255) DEFAULT '',
    `is_guest` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1: 游客, 0: 正式用户',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_openid` (`openid`),
    INDEX `idx_username` (`username`),
    INDEX `idx_is_guest` (`is_guest`),
    INDEX `idx_updated_at` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE='utf8mb4_unicode_ci' COMMENT='用户表';

-- 归档历史记录表
CREATE TABLE IF NOT EXISTS `archived_tarot_logs` (
    `id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL COMMENT '关联 users.id',
    `session_id` VARCHAR(64) NOT NULL COMMENT '单次占卜会话ID',
    `spread_type` VARCHAR(32) NOT NULL COMMENT '牌阵类型: 单牌阵/三牌阵/时间线',
    `card_array` JSON NOT NULL COMMENT '抽出的牌阵 JSON 结构',
    `user_question` TEXT NOT NULL COMMENT '用户求问的问题',
    `ai_interpretation` TEXT NOT NULL COMMENT 'AI 解读回复',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_session_id` (`session_id`),
    INDEX `idx_created_at` (`created_at`),
    CONSTRAINT `fk_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE='utf8mb4_unicode_ci' COMMENT='历史归档表';

-- 清理超过 30 天未登录的游客账号（定时任务）
-- DELETE FROM users
-- WHERE is_guest = 1
--   AND updated_at < NOW() - INTERVAL 30 DAY;
