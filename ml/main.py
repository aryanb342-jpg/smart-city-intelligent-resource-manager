from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np

app = FastAPI()

class DataPoint(BaseModel):
    value: float
    date: str

class PredictRequest(BaseModel):
    data: list[DataPoint]

class AnomalyRequest(BaseModel):
    type: str
    value: float
    department: str

@app.post("/predict")
def predict_usage(req: PredictRequest):
    try:
        df = pd.DataFrame([d.dict() for d in req.data])
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Feature engineering: use days since start as X
        df['days'] = (df['date'] - df['date'].min()).dt.days
        
        X = df[['days']].values
        y = df['value'].values
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Predict next day
        next_day = df['days'].max() + 1
        prediction = model.predict([[next_day]])[0]
        
        if prediction < 0:
            prediction = 0
            
        return {"prediction": float(prediction)}
    except Exception as e:
        print("Prediction error:", e)
        return {"prediction": None, "error": str(e)}

recent_values = {}

@app.post("/detect_anomaly")
def detect_anomaly(req: AnomalyRequest):
    key = f"{req.type}_{req.department}"
    
    if key not in recent_values:
        recent_values[key] = []
        
    recent_values[key].append(req.value)
    if len(recent_values[key]) > 10:
        recent_values[key].pop(0)
        
    if len(recent_values[key]) < 3:
        return {"anomaly": False}
        
    avg = np.mean(recent_values[key][:-1])
    
    if avg == 0:
         return {"anomaly": req.value > 0}

    # Threshold checks
    if req.type == 'water' and req.value > avg * 1.5:
        return {"anomaly": True}
    elif req.value > avg * 1.8:
        return {"anomaly": True}
        
    return {"anomaly": False}
