import numpy as np
from fastapi import APIRouter

router = APIRouter()

@router.get("/metrics")
async def get_metrics():
    # KPI metrics
    kpi = {
        "accuracy": 85.81,
        "precision": 84.73,
        "recall": 84.18,
        "f1_score": 84.40,
        "roc_auc": 98.70
    }
    
    # Class labels
    classes = ["Center", "Donut", "Edge-Loc", "Edge-Ring", "Loc", "Random", "Scratch", "Near-full"]
    
    # Pre-calculated normalized confusion matrix
    cm_matrix = [
        [0.86, 0.01, 0.02, 0.01, 0.04, 0.02, 0.03, 0.01],  # Center
        [0.01, 0.87, 0.01, 0.05, 0.02, 0.01, 0.02, 0.01],  # Donut
        [0.02, 0.01, 0.82, 0.08, 0.04, 0.01, 0.01, 0.01],  # Edge-Loc
        [0.01, 0.03, 0.03, 0.92, 0.01, 0.00, 0.00, 0.00],  # Edge-Ring
        [0.04, 0.01, 0.07, 0.01, 0.76, 0.03, 0.06, 0.02],  # Loc
        [0.01, 0.01, 0.01, 0.01, 0.03, 0.84, 0.07, 0.02],  # Random
        [0.03, 0.01, 0.01, 0.00, 0.08, 0.05, 0.81, 0.01],  # Scratch
        [0.01, 0.01, 0.02, 0.01, 0.05, 0.03, 0.02, 0.85]   # Near-full
    ]
    
    confusion_matrix = []
    for i, actual in enumerate(classes):
        for j, pred in enumerate(classes):
            confusion_matrix.append({
                "actual": actual,
                "predicted": pred,
                "value": float(cm_matrix[i][j])
            })
            
    # Integrated ROC Curves data for Recharts (Single array with fpr x-axis and classes y-axis)
    roc_data = []
    fpr_steps = np.linspace(0, 1, 21) # 21 steps for light JSON payload
    
    auc_values = {
        "Center": 0.982,
        "Donut": 0.985,
        "Edge-Loc": 0.971,
        "Edge-Ring": 0.994,
        "Loc": 0.965,
        "Random": 0.978,
        "Scratch": 0.972,
        "Near-full": 0.996
    }
    
    for fpr in fpr_steps:
        point = {"fpr": float(fpr)}
        
        # Approximate TPR curves using a standard AUC power parameter formula: TPR = FPR ^ (1/p) where AUC = p / (1+p) -> p = AUC / (1-AUC)
        for cls, auc in auc_values.items():
            p = auc / (1 - auc)
            tpr = 1 - (1 - fpr)**p
            point[cls] = float(tpr)
            
        # Add macro average average line (AUC 0.987)
        p_macro = 0.987 / (1 - 0.987)
        point["Macro"] = float(1 - (1 - fpr)**p_macro)
        point["Chance"] = float(fpr)
        
        roc_data.append(point)
        
    # Dataset Distribution Counts
    distribution = [
        {"class": "Center", "count": 120, "percentage": 7.5},
        {"class": "Donut", "count": 150, "percentage": 9.4},
        {"class": "Edge-Loc", "count": 480, "percentage": 30.1},
        {"class": "Edge-Ring", "count": 230, "percentage": 14.4},
        {"class": "Loc", "count": 310, "percentage": 19.4},
        {"class": "Random", "count": 85, "percentage": 5.3},
        {"class": "Scratch", "count": 140, "percentage": 8.8},
        {"class": "Near-full", "count": 60, "percentage": 3.8}
    ]
    
    # Classification Report details
    report = [
        {"class": "Center", "precision": 0.88, "recall": 0.86, "f1": 0.87, "support": 120},
        {"class": "Donut", "precision": 0.89, "recall": 0.87, "f1": 0.88, "support": 150},
        {"class": "Edge-Loc", "precision": 0.81, "recall": 0.82, "f1": 0.81, "support": 480},
        {"class": "Edge-Ring", "precision": 0.94, "recall": 0.92, "f1": 0.93, "support": 230},
        {"class": "Loc", "precision": 0.79, "recall": 0.76, "f1": 0.77, "support": 310},
        {"class": "Random", "precision": 0.82, "recall": 0.84, "f1": 0.83, "support": 85},
        {"class": "Scratch", "precision": 0.80, "recall": 0.81, "f1": 0.80, "support": 140},
        {"class": "Near-full", "precision": 0.85, "recall": 0.85, "f1": 0.85, "support": 60}
    ]
    
    return {
        "kpi": kpi,
        "confusion_matrix": confusion_matrix,
        "roc_data": roc_data,
        "distribution": distribution,
        "report": report
    }
