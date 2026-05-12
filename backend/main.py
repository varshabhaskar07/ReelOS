import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.channels import router as channels_router
from routes.generate import router as generate_router
from routes.content import router as content_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(
    title="ReelOS API",
    description="AI Content Operating System — one operator, 10+ channels, 20 reels/day",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(channels_router, prefix="/api/channels", tags=["Channels"])
app.include_router(generate_router, prefix="/api/generate", tags=["Generate"])
app.include_router(content_router, prefix="/api/content", tags=["Content"])


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "service": "ReelOS API", "version": "1.0.0"}
