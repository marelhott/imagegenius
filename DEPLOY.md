# Návod na nasazení AI Image Generator

## 1. Příprava RunPod prostředí

### Krok 1: Vytvoření RunPod Podu
1. Přihlaste se na [RunPod.io](https://runpod.io)
2. Vytvořte nový Pod s GPU (doporučeno: RTX 4090 nebo A100)
3. Použijte template s předinstalovaným Pythonem a CUDA

### Krok 2: Naklonování repositáře
```bash
# Připojte se k Podu přes SSH nebo Jupyter
cd /workspace
git clone https://github.com/VASE_GITHUB_REPO.git .
```

### Krok 3: Instalace závislostí
```bash
# Nainstalujte Python balíčky
pip install -r backend/requirements.txt

# Ověřte instalaci PyTorch s CUDA
python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')"
```

## 2. Příprava modelů

### Stažení SDXL modelů
1. Vytvořte složku pro modely:
```bash
mkdir -p /models
```

2. Stáhněte SDXL model (.safetensors soubor):
```bash
# Příklad stažení základního SDXL modelu
cd /models
wget https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors

# Nebo nahrajte vlastní .safetensors modely do této složky
```

### Doporučené modely
- **Základní SDXL**: `sd_xl_base_1.0.safetensors`
- **Realistické**: `realvisxlV40.safetensors`
- **Anime**: `animagineXLV3_v30.safetensors`

## 3. Spuštění backendu

### Testovací spuštění
```bash
cd /workspace
uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload
```

### Produkční spuštění
```bash
cd /workspace
uvicorn backend.app:app --host 0.0.0.0 --port 8000 --workers 1
```

### Ověření funkčnosti
```bash
# Test health check
curl http://localhost:8000/health

# Test seznamu modelů
curl http://localhost:8000/models
```

## 4. Propojení s frontendem

### Získání RunPod endpointu
1. V RunPod dashboard najděte váš Pod
2. Zkopírujte "Public IP" nebo "Exposed Ports" URL
3. URL bude ve formátu: `https://YOUR_POD_ID-8000.proxy.runpod.net`

### Nastavení frontendu
1. Otevřte Replit projekt
2. V souboru `client/src/pages/home.tsx` změňte:
```typescript
// Nahraďte místní API URL RunPod endpointem
const API_URL = "https://YOUR_POD_ID-8000.proxy.runpod.net";
```

## 5. Testování kompletního systému

### Backend testy
```bash
# Test načtení modelu
curl http://YOUR_ENDPOINT/health

# Test seznamu modelů  
curl http://YOUR_ENDPOINT/models
```

### Frontend testy
1. Otevřete Replit aplikaci
2. Nahrajte testovací obrázek
3. Nastavte parametry (CFG: 7.5, Steps: 20, Strength: 0.75)
4. Klikněte "Generovat obrázek"
5. Ověřte, že se zobrazí vygenerovaný obrázek

## 6. Možné problémy a řešení

### Chyba: "Model není načten"
- Ověřte, že existují .safetensors soubory ve složce `/models`
- Restartujte backend server

### Chyba: "CUDA out of memory"
- Použijte Pod s více VRAM (min. 16GB)
- Snižte rozlišení obrázků v kódu

### Chyba: "Connection refused"
- Ověřte, že backend běží na portu 8000
- Zkontrolujte firewall nastavení RunPod

### Chyba: "CORS policy"
- Backend má nakonfigurovaný CORS pro všechny domény
- Ověřte správnost API URL ve frontendu

## 7. Optimalizace výkonu

### GPU optimalizace
```python
# V app.py už jsou implementované optimalizace:
# - model_cpu_offload() pro úsporu VRAM
# - torch.float16 pro rychlejší inference
# - torch.no_grad() pro úsporu paměti
```

### Předčasné načtení
- Model se načte automaticky při startu
- První generování může trvat déle (caching)

## 8. Bezpečnost

### Produkční nasazení
1. Omezte CORS na konkrétní domény
2. Přidejte API klíče pro autentifikaci
3. Nastavte rate limiting
4. Používejte HTTPS endpoints

### Doporučené úpravy pro produkci
```python
# V app.py změňte:
allow_origins=["https://your-frontend-domain.com"]
```

## 9. Monitoring

### Sledování výkonu
```bash
# GPU využití
nvidia-smi

# Systémové prostředky
htop

# Backend logy
tail -f backend_logs.txt
```

### Health check endpoint
- `GET /health` - kompletní systémová diagnostika
- `GET /` - základní status check

---

Po dokončení těchto kroků bude váš AI Image Generator plně funkční s backendem na RunPod a frontendem na Replit!