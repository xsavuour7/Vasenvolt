import os
import json
from typing import List, Optional
from pydantic import BaseModel, Field, validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Pick env file based on APP_ENV
app_env = os.getenv("APP_ENV", "development")
env_file = f".env.{app_env}"

class DatabaseSettings(BaseModel):
    url: str = Field(..., description="Main database connection URL")
    test_url: str = Field(..., description="Test database connection URL")
    pool_size: int = Field(default=10, description="Database connection pool size")
    max_overflow: int = Field(default=20, description="Maximum overflow connections")
    pool_timeout: int = Field(default=30, description="Connection pool timeout in seconds")
    pool_recycle: int = Field(default=3600, description="Connection pool recycle time in seconds")

class SecuritySettings(BaseModel):
    secret_key: str = Field(..., description="JWT secret key for token signing")
    algorithm: str = Field(default="HS256", description="JWT algorithm")
    access_token_expire_minutes: int = Field(default=30, description="Access token expiration time")
    refresh_token_expire_days: int = Field(default=7, description="Refresh token expiration time")

class RedisSettings(BaseModel):
    url: str = Field(..., description="Redis connection URL")

class CORSSettings(BaseModel):
    frontend_url: str = Field(..., description="Frontend application URL")
    allowed_origins: List[str] = Field(..., description="Allowed CORS origins")

class SMTPSettings(BaseModel):
    host: str = Field(default="", description="SMTP server host")
    port: int = Field(default=587, description="SMTP server port")
    username: str = Field(default="", description="SMTP username")
    password: str = Field(default="", description="SMTP password")
    use_tls: bool = Field(default=True, description="Use TLS for SMTP")
    from_email: str = Field(default="", description="From email address")
    from_name: str = Field(default="", description="From name")

class ExternalAPISettings(BaseModel):
    google_maps_api_key: str = Field(default="", description="Google Maps API key")
    weather_api_key: str = Field(default="", description="Weather API key")

class MonitoringSettings(BaseModel):
    log_level: str = Field(default="INFO", description="Logging level")
    sentry_dsn: str = Field(default="", description="Sentry DSN for error tracking")
    prometheus_enabled: bool = Field(default=False, description="Enable Prometheus metrics")

class RateLimitSettings(BaseModel):
    requests: int = Field(default=1000, description="Rate limit requests per window")
    window: int = Field(default=900, description="Rate limit window in seconds")

class StorageSettings(BaseModel):
    type: str = Field(default="local", description="Storage type (local, s3)")
    path: str = Field(default="./storage", description="Local storage path")
    aws_access_key_id: str = Field(default="", description="AWS access key ID")
    aws_secret_access_key: str = Field(default="", description="AWS secret access key")
    aws_region: str = Field(default="us-east-1", description="AWS region")
    aws_s3_bucket: str = Field(default="", description="AWS S3 bucket name")

class Settings(BaseSettings):
    # Environment
    environment: str = Field(..., description="Application environment")
    debug: bool = Field(default=False, description="Debug mode")
    
    # Database
    database_url: str = Field(..., description="Main database URL")
    database_test_url: str = Field(..., description="Test database URL")
    db_pool_size: int = Field(default=10, description="Database pool size")
    db_max_overflow: int = Field(default=20, description="Database max overflow")
    db_pool_timeout: int = Field(default=30, description="Database pool timeout")
    db_pool_recycle: int = Field(default=3600, description="Database pool recycle")
    
    # Security
    secret_key: str = Field(..., description="JWT secret key")
    algorithm: str = Field(default="HS256", description="JWT algorithm")
    access_token_expire_minutes: int = Field(default=30, description="Access token expiry")
    refresh_token_expire_days: int = Field(default=7, description="Refresh token expiry")
    
    # Redis
    redis_url: str = Field(..., description="Redis URL")
    
    # CORS
    frontend_url: str = Field(..., description="Frontend URL")
    allowed_origins: List[str] = Field(..., description="Allowed CORS origins")
    
    # SMTP
    smtp_host: str = Field(default="", description="SMTP host")
    smtp_port: int = Field(default=587, description="SMTP port")
    smtp_username: str = Field(default="", description="SMTP username")
    smtp_password: str = Field(default="", description="SMTP password")
    smtp_use_tls: bool = Field(default=True, description="SMTP use TLS")
    smtp_from_email: str = Field(default="", description="SMTP from email")
    smtp_from_name: str = Field(default="", description="SMTP from name")
    
    # External APIs
    google_maps_api_key: str = Field(default="", description="Google Maps API key")
    weather_api_key: str = Field(default="", description="Weather API key")
    
    # Monitoring
    log_level: str = Field(default="INFO", description="Log level")
    sentry_dsn: str = Field(default="", description="Sentry DSN")
    prometheus_enabled: bool = Field(default=False, description="Prometheus enabled")
    
    # Rate Limiting
    rate_limit_requests: int = Field(default=1000, description="Rate limit requests")
    rate_limit_window: int = Field(default=900, description="Rate limit window")
    
    # Storage
    storage_type: str = Field(default="local", description="Storage type")
    storage_path: str = Field(default="./storage", description="Storage path")
    aws_access_key_id: str = Field(default="", description="AWS access key")
    aws_secret_access_key: str = Field(default="", description="AWS secret key")
    aws_region: str = Field(default="us-east-1", description="AWS region")
    aws_s3_bucket: str = Field(default="", description="AWS S3 bucket")

    model_config = SettingsConfigDict(
        env_file=env_file,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    @validator('secret_key')
    def validate_secret_key(cls, v):
        if len(v) < 32:
            raise ValueError('SECRET_KEY must be at least 32 characters long')
        return v

    @validator('allowed_origins', pre=True)
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [v]
        return v

    def get_database_settings(self) -> DatabaseSettings:
        return DatabaseSettings(
            url=self.database_url,
            test_url=self.database_test_url,
            pool_size=self.db_pool_size,
            max_overflow=self.db_max_overflow,
            pool_timeout=self.db_pool_timeout,
            pool_recycle=self.db_pool_recycle
        )

    def get_security_settings(self) -> SecuritySettings:
        return SecuritySettings(
            secret_key=self.secret_key,
            algorithm=self.algorithm,
            access_token_expire_minutes=self.access_token_expire_minutes,
            refresh_token_expire_days=self.refresh_token_expire_days
        )

    def get_redis_settings(self) -> RedisSettings:
        return RedisSettings(url=self.redis_url)

    def get_cors_settings(self) -> CORSSettings:
        return CORSSettings(
            frontend_url=self.frontend_url,
            allowed_origins=self.allowed_origins
        )

    def get_smtp_settings(self) -> SMTPSettings:
        return SMTPSettings(
            host=self.smtp_host,
            port=self.smtp_port,
            username=self.smtp_username,
            password=self.smtp_password,
            use_tls=self.smtp_use_tls,
            from_email=self.smtp_from_email,
            from_name=self.smtp_from_name
        )

    def get_external_api_settings(self) -> ExternalAPISettings:
        return ExternalAPISettings(
            google_maps_api_key=self.google_maps_api_key,
            weather_api_key=self.weather_api_key
        )

    def get_monitoring_settings(self) -> MonitoringSettings:
        return MonitoringSettings(
            log_level=self.log_level,
            sentry_dsn=self.sentry_dsn,
            prometheus_enabled=self.prometheus_enabled
        )

    def get_rate_limit_settings(self) -> RateLimitSettings:
        return RateLimitSettings(
            requests=self.rate_limit_requests,
            window=self.rate_limit_window
        )

    def get_storage_settings(self) -> StorageSettings:
        return StorageSettings(
            type=self.storage_type,
            path=self.storage_path,
            aws_access_key_id=self.aws_access_key_id,
            aws_secret_access_key=self.aws_secret_access_key,
            aws_region=self.aws_region,
            aws_s3_bucket=self.aws_s3_bucket
        )

# Global settings instance
try:
    settings = Settings()
except Exception as e:
    print(f"❌ Configuration Error: {e}")
    print(f"💡 Please check your {env_file} file and ensure all required variables are set.")
    print("📖 See ENVIRONMENT.md for required environment variables.")
    raise

