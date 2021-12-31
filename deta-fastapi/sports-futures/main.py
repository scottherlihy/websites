import json

from fastapi.responses import JSONResponse
from fastapi import FastAPI
from pathlib import Path


PATH = Path(__file__).parent / "data/example_response.json"
with PATH.open() as f:
    CACHED_DATA = json.load(f)

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/futures")
def read_item():
    print(CACHED_DATA[0]["bookmakers"])
    return JSONResponse(content=CACHED_DATA[0]["bookmakers"])
