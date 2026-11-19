import logging
import os
import time
import uuid
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.cache import reference_data_cache
from app.core.config import settings
from app.api.v1.router import api_router

logger = logging.getLogger("nexus.app")
perf_logger = logging.getLogger("nexus.perf")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=None if settings.is_production else f"{settings.API_V1_STR}/openapi.json",
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    description="FastAPI Backend for Nexus ERP (Centralized JWT & RBAC Security)",
)

# GZip response compression for JSON/text payloads >= 500 bytes (70-90% smaller responses)
app.add_middleware(GZipMiddleware, minimum_size=500)

# Strict CORS Middleware (explicit approved origins only; never wildcard with credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-CSRF-Token", "X-Requested-With", "X-Request-Id"],
    expose_headers=["Content-Disposition", "X-Request-Id", "X-Process-Time-Ms"],
)


# Security Headers, Request Timing & Reference Cache Invalidation Middleware
@app.middleware("http")
async def add_security_and_perf_headers(request: Request, call_next):
    req_id = request.headers.get("X-Request-Id") or uuid.uuid4().hex[:12]
    request.state.request_id = req_id
    t0 = time.perf_counter()

    response = await call_next(request)

    elapsed_ms = (time.perf_counter() - t0) * 1000.0
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers["X-Request-Id"] = req_id
    response.headers["X-Process-Time-Ms"] = f"{elapsed_ms:.1f}"

    path = request.url.path
    if path.startswith(settings.API_V1_STR):
        response.headers.setdefault("Cache-Control", "no-store")
        # Automatically invalidate Master reference cache on any mutating request
        if request.method in ("POST", "PUT", "PATCH", "DELETE") and response.status_code < 400:
            if "/master/" in path:
                reference_data_cache.invalidate_prefix("master:")

    if elapsed_ms >= 500.0:
        perf_logger.warning(
            "SLOW_REQUEST req_id=%s method=%s path=%s status=%s duration_ms=%.1f",
            req_id,
            request.method,
            path,
            response.status_code,
            elapsed_ms,
        )
    return response


# Global Exception Handler (never leak secrets, stack traces, or DB credentials)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    content = {
        "success": False,
        "detail": "An internal server error occurred.",
    }
    if settings.DEBUG and not settings.is_production:
        content["error"] = exc.__class__.__name__
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=content,
    )


# Public Health Check (lightweight, unauthenticated, exposes no internal details)
@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"], include_in_schema=False)
def health_check():
    return {"status": "ok"}


# Register Version 1 Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount Frontend Static Files if directory exists
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend"))
if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir, html=True), name="static")
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

