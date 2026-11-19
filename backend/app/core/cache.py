"""
Lightweight, thread-safe in-memory TTL cache for Nexus ERP.

Used for:
1. Short-lived authenticated user / RBAC context (30s TTL) — immediately
   evicted on logout, token revocation, or user/role modification.
2. Relatively static Master reference lists (60s TTL) — automatically
   invalidated on any write (POST/PUT/PATCH/DELETE) to that resource.
"""

import threading
import time
from typing import Any, Callable, Dict, Optional, Tuple


class TTLCache:
    def __init__(self, default_ttl: float = 60.0, max_size: int = 1024):
        self._default_ttl = float(default_ttl)
        self._max_size = int(max_size)
        self._store: Dict[str, Tuple[float, Any]] = {}
        self._lock = threading.RLock()

    def get(self, key: str) -> Any:
        now = time.monotonic()
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            expires_at, value = entry
            if now >= expires_at:
                self._store.pop(key, None)
                return None
            return value

    def set(self, key: str, value: Any, ttl: Optional[float] = None) -> None:
        expires_at = time.monotonic() + (self._default_ttl if ttl is None else float(ttl))
        with self._lock:
            if len(self._store) >= self._max_size and key not in self._store:
                self._evict_expired_locked()
                if len(self._store) >= self._max_size:
                    # Drop oldest inserted key
                    oldest_key = next(iter(self._store), None)
                    if oldest_key is not None:
                        self._store.pop(oldest_key, None)
            self._store[key] = (expires_at, value)

    def delete(self, key: str) -> None:
        with self._lock:
            self._store.pop(key, None)

    def invalidate_prefix(self, prefix: str) -> int:
        removed = 0
        with self._lock:
            keys = [k for k in self._store if k.startswith(prefix)]
            for k in keys:
                self._store.pop(k, None)
                removed += 1
        return removed

    def clear(self) -> None:
        with self._lock:
            self._store.clear()

    def _evict_expired_locked(self) -> None:
        now = time.monotonic()
        expired = [k for k, (exp, _) in self._store.items() if now >= exp]
        for k in expired:
            self._store.pop(k, None)

    def get_or_set(self, key: str, loader: Callable[[], Any], ttl: Optional[float] = None) -> Any:
        cached = self.get(key)
        if cached is not None:
            return cached
        val = loader()
        if val is not None:
            self.set(key, val, ttl=ttl)
        return val


# Shared caches
auth_user_cache = TTLCache(default_ttl=30.0, max_size=512)
reference_data_cache = TTLCache(default_ttl=60.0, max_size=512)
