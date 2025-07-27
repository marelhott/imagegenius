from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import torch
from diffusers import StableDiffusionImg2ImgPipeline
from PIL import Image
import io
import os
import glob
from typing import List, Optional
import logging

# Nastavení logování
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Image Generator API", version="1.0.0")

# CORS middleware pro propojení s frontendem
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # V produkci nastavit konkrétní domény
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Globální proměnná pro pipeline
pipe = None
device = "cuda" if torch.cuda.is_available() else "cpu"

@app.on_event("startup")
async def load_model():
    """Načte model při startu aplikace"""
    global pipe
    
    try:
        # Najdi první .safetensors soubor ve složce /models
        model_files = glob.glob("/models/*.safetensors")
        
        if not model_files:
            logger.warning("Žádné .safetensors modely nenalezeny ve složce /models")
            return
        
        model_path = model_files[0]
        logger.info(f"Načítám model: {model_path}")
        
        # Načti pipeline
        pipe = StableDiffusionImg2ImgPipeline.from_single_file(
            model_path,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            safety_checker=None,
            requires_safety_checker=False
        )
        
        if device == "cuda":
            pipe = pipe.to(device)
            pipe.enable_model_cpu_offload()
        
        logger.info(f"Model úspěšně načten na zařízení: {device}")
        
    except Exception as e:
        logger.error(f"Chyba při načítání modelu: {str(e)}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "AI Image Generator API je spuštěná",
        "device": device,
        "model_loaded": pipe is not None
    }

@app.get("/models")
async def get_models() -> List[str]:
    """Vrátí seznam dostupných .safetensors modelů"""
    try:
        # Najdi všechny .safetensors soubory ve složce /models
        model_files = glob.glob("/models/*.safetensors")
        
        # Vrať pouze názvy souborů (bez cesty)
        model_names = [os.path.basename(model) for model in model_files]
        
        logger.info(f"Nalezeno {len(model_names)} modelů")
        return model_names
        
    except Exception as e:
        logger.error(f"Chyba při načítání seznamu modelů: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chyba při načítání modelů: {str(e)}")

@app.post("/img2img")
async def generate_image(
    image: UploadFile = File(...),
    cfg_scale: float = Form(7.5),
    steps: int = Form(20),
    strength: float = Form(0.75),
    prompt: str = Form(""),
    negative_prompt: str = Form("")
):
    """Generuje nový obrázek z existujícího obrázku"""
    
    if pipe is None:
        raise HTTPException(status_code=503, detail="Model není načten. Zkontrolujte, zda existují modely ve složce /models")
    
    try:
        # Načti a zpracuj vstupní obrázek
        image_data = await image.read()
        input_image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        # Změň velikost obrázku na 512x512 (optimální pro SDXL)
        input_image = input_image.resize((512, 512))
        
        logger.info(f"Generování obrázku s parametry: cfg={cfg_scale}, steps={steps}, strength={strength}")
        
        # Generuj obrázek
        with torch.no_grad():
            result = pipe(
                prompt=prompt if prompt else "high quality, detailed",
                image=input_image,
                strength=strength,
                guidance_scale=cfg_scale,
                num_inference_steps=steps,
                negative_prompt=negative_prompt if negative_prompt else "blurry, low quality, distorted"
            )
        
        # Konvertuj výsledek na PNG
        output_image = result.images[0]
        
        # Ulož do byte bufferu
        img_buffer = io.BytesIO()
        output_image.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        logger.info("Obrázek úspěšně vygenerován")
        
        return Response(
            content=img_buffer.getvalue(),
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=generated_image.png"}
        )
        
    except Exception as e:
        logger.error(f"Chyba při generování obrázku: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chyba při generování: {str(e)}")

@app.get("/health")
async def health_check():
    """Podrobný health check"""
    return {
        "status": "healthy",
        "device": device,
        "cuda_available": torch.cuda.is_available(),
        "model_loaded": pipe is not None,
        "models_folder_exists": os.path.exists("/models"),
        "available_models": len(glob.glob("/models/*.safetensors"))
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)