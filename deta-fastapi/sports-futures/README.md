# About

A website for visualizing sport chamionship futures pulled from https://the-odds-api.com/releases/outrights.html.

Will be an experiment to gain expertise with FastApi as well as data visualization.


# To run locally
- From the root of the directory run `uvicorn main:app --reload`
- Go to http://localhost:8000/
- This service is build with FastApi which means you get swagger docs for free at http://localhost:8000/docs

# To deploy
- This project uses deta for deployment. Learn more here:
-- https://fastapi.tiangolo.com/deployment/deta/
-- https://docs.deta.sh/docs/home/
- Clone the deta micro `deta clone --name sports-futures --project default`
- Authenticate with deta `deta login`
- Run `deta deploy`
- See the service deployed here: https://6borhd.deta.dev/