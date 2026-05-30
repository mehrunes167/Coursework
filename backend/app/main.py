from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from app.routes import auth, trips
from app.services.db import init_db
import os

app = FastAPI(title="Travel API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()

# API-роуты
app.include_router(auth.router, prefix="/api")
app.include_router(trips.router, prefix="/api")

BUILD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "build")
BUILD_DIR = os.path.abspath(BUILD_DIR)

@app.exception_handler(404)
async def spa_fallback(request: Request, exc):
    if request.url.path.startswith("/api"):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
    full_path = request.url.path.lstrip("/")
    file_path = os.path.join(BUILD_DIR, full_path)
    if full_path and os.path.isfile(file_path):
        return FileResponse(file_path)
    index_file = os.path.join(BUILD_DIR, "index.html")
    if os.path.isfile(index_file):
        return FileResponse(index_file)
    return JSONResponse(status_code=404, content={"detail": "Static file not found"})

@app.get("/")
async def root():
    index_file = os.path.join(BUILD_DIR, "index.html")
    if os.path.isfile(index_file):
        return FileResponse(index_file)
    return {"message": "Build folder not found"}

build_dir = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "build")
if os.path.isdir(build_dir):
    app.mount("/", StaticFiles(directory=build_dir, html=True), name="static")
