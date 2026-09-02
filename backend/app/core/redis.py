import logging
import redis.asyncio as aioredis
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

redis_client: Optional[aioredis.Redis] = None
redis_available: bool = True
_in_memory_blacklist: set = set()
_in_memory_rate_limit: dict = {}


async def get_redis() -> Optional[aioredis.Redis]:
    global redis_client, redis_available
    if not redis_available:
        return None
    if redis_client is None:
        try:
            client = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=1.0
            )
            await client.ping()
            redis_client = client
        except Exception as e:
            logger.warning(f"Redis connection unavailable ({e}). Falling back to in-memory store.")
            redis_available = False
            redis_client = None
    return redis_client


async def close_redis():
    global redis_client
    if redis_client is not None:
        try:
            await redis_client.close()
        except Exception:
            pass
        redis_client = None


class RedisService:
    @staticmethod
    async def blacklist_token(token_jti: str, expire_seconds: int):
        try:
            redis = await get_redis()
            if redis:
                await redis.setex(f"token_blacklist:{token_jti}", expire_seconds, "true")
                return
        except Exception as e:
            logger.warning(f"Failed to blacklist token in Redis ({e}); using in-memory store.")
        _in_memory_blacklist.add(token_jti)

    @staticmethod
    async def is_token_blacklisted(token_jti: str) -> bool:
        try:
            redis = await get_redis()
            if redis:
                val = await redis.get(f"token_blacklist:{token_jti}")
                return val is not None
        except Exception as e:
            logger.warning(f"Failed to check token blacklist in Redis ({e}); checking in-memory store.")
        return token_jti in _in_memory_blacklist

    @staticmethod
    async def check_rate_limit(key: str, limit: int = 100, window_seconds: int = 60) -> bool:
        """Sliding window / fixed counter rate limiting."""
        try:
            redis = await get_redis()
            if redis:
                current = await redis.incr(key)
                if current == 1:
                    await redis.expire(key, window_seconds)
                return current <= limit
        except Exception as e:
            logger.warning(f"Failed rate limit check in Redis ({e}); using in-memory fallback.")
        current = _in_memory_rate_limit.get(key, 0) + 1
        _in_memory_rate_limit[key] = current
        return current <= limit

