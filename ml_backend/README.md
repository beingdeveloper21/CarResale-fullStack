# ML Backend

FastAPI service for car resale price prediction.

Train the model from the repository root:

```powershell
python ml_backend/train_model.py --rows 60000
```

Run the ML API:

```powershell
python -m uvicorn ml_backend.app:app --host 127.0.0.1 --port 8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

Express calls this service through `ML_API_URL`, defaulting to `http://127.0.0.1:8000`.
