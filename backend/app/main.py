from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth_router, document_router, logs_router
from app.services.kafka_logger import kafka_logger

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await kafka_logger.start()

@app.on_event("shutdown")
async def shutdown_event():
    await kafka_logger.stop()

app.include_router(auth_router.router, prefix="/auth", tags=["auth"])
app.include_router(document_router.router, prefix="/documents", tags=["documents"])
app.include_router(logs_router.router, prefix="/analysis", tags=["analysis"])

# Root endpoint with a welcoming message
@app.get("/")
async def root():
    return {"message": "Welcome to the Interactive Learning Library"}