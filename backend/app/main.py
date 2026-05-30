from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, trips
from app.services.db import init_db
from contextlib import asynccontextmanager
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="Travel API", lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router, prefix="/api")
app.include_router(trips.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "API is working"}
