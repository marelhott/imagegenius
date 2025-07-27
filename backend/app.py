from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

# CORS middleware pre pripojenie s frontendom
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
API_KEY = "dl-7CCB2D4890494EFD8D074301679B850F"
MODEL_ID = "ckp_HSxsm89y"

@app.post("/img2img")
async def img2img(file: UploadFile, prompt: str = Form(""), strength: float = Form(0.6)):
    files = {"image": (file.filename, await file.read(), file.content_type)}
    data = {"model_id": MODEL_ID, "prompt": prompt, "strength": strength}
    headers = {"Authorization": f"Bearer {API_KEY}"}
    r = requests.post("https://api.dreamlook.ai/v1/img2img", headers=headers, data=data, files=files)
    return JSONResponse(r.json())

@app.get("/health")
async def health():
    return {"status": "ok"}