# Návod na nasazení AI Image Generator s DreamLook API

## 1. Příprava RunPod prostředí

### Krok 1: Vytvoření RunPod Podu
1. Přihlaste se na [RunPod.io](https://runpod.io)
2. Vytvořte nový Pod (základní CPU Pod je dostačující)
3. Použijte template s předinstalovaným Pythonem

### Krok 2: Naklonování repositáře
```bash
# Připojte se k Podu přes SSH nebo Jupyter
cd /workspace
git clone https://github.com/VASE_GITHUB_REPO.git ai-image-generator
cd ai-image-generator
```

### Krok 3: Instalace závislostí
```bash
# Nainstalujte Python balíčky
cd backend
pip install -r requirements.txt
```

## 2. Konfigurace DreamLook API

### Získání API klíče
1. Zaregistrujte se na [DreamLook.ai](https://dreamlook.ai)
2. Získejte API klíč z vašeho účtu
3. Nastavte environment proměnnou:

```bash
export DREAMLOOK_API_KEY="váš_api_klíč_zde"
```

### Permanentní nastavení API klíče
```bash
echo 'export DREAMLOOK_API_KEY="váš_api_klíč_zde"' >> ~/.bashrc
source ~/.bashrc
```

## 3. Spuštění backendu

### Ověření API klíče
```bash
echo $DREAMLOOK_API_KEY
# Měl by zobrazit váš API klíč
```

### Spuštění serveru
```bash
cd /workspace/ai-image-generator/backend
uvicorn app:app --host 0.0.0.0 --port 8000
```

### Ověření funkčnosti
```bash
# Test health check
curl http://localhost:8000/health
# Měl by vrátit: {"status":"ok"}
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

### Chyba: "API klíč není nastaven"
- Ověřte proměnnou prostředí: `echo $DREAMLOOK_API_KEY`
- Znovu nastavte klíč a restartujte server

### Chyba: "Unauthorized" (401)
- Zkontrolujte platnost API klíče na DreamLook.ai
- Ověřte, že máte dostatečný kredit

### Chyba: "Connection refused"
- Ověřte, že backend běží na portu 8000
- Zkontrolujte firewall nastavení RunPod

### Chyba: "CORS policy"
- Backend má nakonfigurovaný CORS pro všechny domény
- Ověřte správnost API URL ve frontendu

## 7. Výhody DreamLook API

### Rychlost
- Žádné čekání na načítání modelů
- Rychlé generování díky cloudové infrastruktuře

### Nižší nároky
- Nepotřebujete GPU na RunPod
- Základní CPU Pod je dostačující
- Nižší náklady na hosting

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