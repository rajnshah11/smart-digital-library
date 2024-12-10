from fastapi import FastAPI
from app.views.routes import router
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import db


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Interactive Learning Library"}