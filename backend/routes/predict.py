import io
import tempfile
import numpy as np
import torch
import cv2
from fastapi import APIRouter, File, UploadFile, HTTPException, Request
from pathlib import Path

from src.evaluation.inference import preprocess_wafer_array

router = APIRouter()

@router.post("/predict")
async def predict_wafer(request: Request, file: UploadFile = File(...)):
    # 1. Retrieve the pre-loaded model and metadata from the application state
    model = getattr(request.app.state, "model", None)
    class_to_index = getattr(request.app.state, "class_to_index", None)
    device = getattr(request.app.state, "device", None)
    
    if model is None or class_to_index is None:
        raise HTTPException(
            status_code=500, 
            detail="Model is not loaded. Please ensure training has completed and a valid checkpoint exists."
        )
    
    # 2. Read file contents into memory
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    
    # 3. Load wafer map as a numpy array based on file extension
    filename = file.filename or ""
    try:
        if filename.endswith(".npy"):
            # Load raw 2D numpy array
            image_np = np.load(io.BytesIO(contents), allow_pickle=False)
        else:
            # Load image using OpenCV from buffer
            nparr = np.frombuffer(contents, np.uint8)
            image_np = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
            
        if image_np is None:
            raise ValueError("OpenCV could not decode the uploaded image.")
            
    except Exception as e:
        raise HTTPException(
            status_code=400, 
            detail=f"Failed to read or decode file: {e}"
        )
        
    # 4. Preprocess and run inference
    try:
        # Preprocess to tensor
        tensor = preprocess_wafer_array(image_np).to(device)
        
        # Run forward pass
        with torch.no_grad():
            logits = model(tensor)
            probabilities = torch.softmax(logits, dim=1)[0]
            
        # Extract Top-3 predicted classes
        top_k = min(3, len(class_to_index))
        top_probs, top_indices = torch.topk(probabilities, k=top_k)
        
        index_to_class = {index: name for name, index in class_to_index.items()}
        predictions = [
            {
                "class_name": index_to_class[idx.item()],
                "probability": float(prob.item())
            }
            for prob, idx in zip(top_probs, top_indices)
        ]
        
        return {
            "predicted_class": predictions[0]["class_name"],
            "confidence": predictions[0]["probability"],
            "top_predictions": predictions
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Inference execution failed: {e}"
        )
