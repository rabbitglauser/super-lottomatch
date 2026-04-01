from fastapi import FastAPI


# TODO: Make a connection from the main.py backend to the DB

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Backend is running"}