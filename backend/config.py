# config.py - 后端环境配置

import os
from typing import Dict, Any

class Config:
    """基础配置类"""
    
    # 数据库配置
    DB_HOST = os.getenv('DB_HOST', '121.41.52.128')
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'Youxiuqingnianjiushiwo_0516')
    DB_NAME = os.getenv('DB_NAME', 'songlist')
    DB_PORT = int(os.getenv('DB_PORT', '3306'))
    
    # API配置
    API_HOST = os.getenv('API_HOST', '0.0.0.0')
    API_PORT = int(os.getenv('API_PORT', '8000'))
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # CORS配置
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '*').split(',')
    
    @property
    def db_config(self) -> Dict[str, Any]:
        return {
            "host": self.DB_HOST,
            "user": self.DB_USER,
            "password": self.DB_PASSWORD,
            "database": self.DB_NAME,
            "port": self.DB_PORT
        }

class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    ALLOWED_ORIGINS = ['http://localhost:8100', 'http://localhost:3000','http://localhost:8101']

class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    # 生产环境下，限制CORS来源
    ALLOWED_ORIGINS = [
        'https://your-domain.com',
        'https://app.your-domain.com'
    ]

class StagingConfig(Config):
    """测试环境配置"""
    DEBUG = True
    ALLOWED_ORIGINS = ['https://staging.your-domain.com']

# 配置映射
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'staging': StagingConfig
}

def get_config() -> Config:
    """根据环境变量获取配置"""
    env = os.getenv('ENVIRONMENT', 'development')
    return config_map.get(env, DevelopmentConfig)()
