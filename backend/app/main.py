import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import auth, trips
from app.services.db import init_db

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="Travel API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API-роуты
app.include_router(auth.router, prefix="/api")
app.include_router(trips.router, prefix="/api")

build_dir = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "build")
if os.path.isdir(build_dir):
    app.mount("/", StaticFiles(directory=build_dir, html=True), name="static")
else:
    @app.get("/")
    async def root():
        return {"message": "Build folder not found. Please compile React first."}
