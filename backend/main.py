from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import get_db
from routers.guest_router import router as guest_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Backend is running"}

app.include_router(guest_router)