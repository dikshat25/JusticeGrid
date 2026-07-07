import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config.settings import settings
from app.api.routes import router as api_router
from app.api.websocket import router as ws_router
from app.services.prompt_loader import prompt_loader

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logging.info(f"Starting up {settings.PROJECT_NAME}...")
    prompt_loader.verify_all_prompts_exist()
    logging.info("All prompt files verified successfully.")
    yield
    # Shutdown actions
    logging.info("Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(ws_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}
