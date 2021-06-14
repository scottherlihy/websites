from fastapi import FastAPI

app = FastAPI()


@app.get('/')
def index():
    return {"message": 'I did it'}


@app.get('/about')
def about():
    return {"data": "I am that dude"}
