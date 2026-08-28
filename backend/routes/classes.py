from fastapi import APIRouter

router = APIRouter()

@router.get("/classes")
async def get_classes():
    return [
        {
            "name": "Center",
            "emoji": "🎯",
            "pattern": "Center Clustered",
            "desc": "A cluster of defects occurring in the central area of the wafer map.",
            "severity": "Medium",
            "yield_impact": "Low-Medium",
            "cause": "Thermal processing inconsistency or spin-coating puddle residues.",
            "stage": "Photolithography (Coating / Development)"
        },
        {
            "name": "Donut",
            "emoji": "🍩",
            "pattern": "Ring-shaped Inner Clustered",
            "desc": "Defects distributed in a concentric ring pattern with a normal center.",
            "severity": "High",
            "yield_impact": "Medium-High",
            "cause": "Asymmetric gas flow rates or plasma etching power fluctuations.",
            "stage": "Dry Etching or Chemical Vapor Deposition (CVD)"
        },
        {
            "name": "Edge-Loc",
            "emoji": "📍",
            "pattern": "Localized Outer Perimeter",
            "desc": "A single localized cluster of defect points near the outer edge.",
            "severity": "Low-Medium",
            "yield_impact": "Low",
            "cause": "Mechanical handling stress or edge bead removal nozzle misalignment.",
            "stage": "Handling/Lithography Edge Bead Removal (EBR)"
        },
        {
            "name": "Edge-Ring",
            "emoji": "⭕",
            "pattern": "Continuous Outer Perimeter",
            "desc": "Defects forming a continuous circular band along the wafer edge.",
            "severity": "High",
            "yield_impact": "High",
            "cause": "Etch gas leaking, improper edge clamp ring shadow, or CVD edge exclusion defects.",
            "stage": "Dry Etch/Chemical Mechanical Planarization (CMP)"
        },
        {
            "name": "Loc",
            "emoji": "📌",
            "pattern": "Localized Random Cluster",
            "desc": "A localized cluster of defects occurring anywhere on the wafer surface.",
            "severity": "Medium",
            "yield_impact": "Medium",
            "cause": "Localized particulate contamination, bubbles, or micro-droplets.",
            "stage": "Deposition / Exposure / Rinsing"
        },
        {
            "name": "Random",
            "emoji": "🌌",
            "pattern": "Scattered Uniform Distribution",
            "desc": "Defect particles scattered uniformly across the entire wafer.",
            "severity": "Medium",
            "yield_impact": "Low-Medium",
            "cause": "Airborne cleanroom particles or chemical contamination in process baths.",
            "stage": "All Fabrication Stages (Ambient Cleanroom Quality)"
        },
        {
            "name": "Scratch",
            "emoji": "✏️",
            "pattern": "Linear Defect Line",
            "desc": "Defects forming a line or curve, representing physical scratches.",
            "severity": "High",
            "yield_impact": "High",
            "cause": "Physical friction from robotic pick-and-place end-effectors or slurry particles in polishing pads.",
            "stage": "Wafer Handling / Chemical Mechanical Planarization (CMP)"
        },
        {
            "name": "Near-full",
            "emoji": "☀️",
            "pattern": "Total Wafer Coverage",
            "desc": "Almost the entire area of the wafer is covered in defect bins.",
            "severity": "Critical",
            "yield_impact": "Critical (Total Loss)",
            "cause": "Severe process failures, complete coating failures, or major equipment shutdowns.",
            "stage": "Photolithography (Complete Exposure / Development Failures)"
        }
    ]
