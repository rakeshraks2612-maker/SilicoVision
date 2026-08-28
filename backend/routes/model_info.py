from fastapi import APIRouter

router = APIRouter()

@router.get("/model-info")
async def get_model_info():
    layers = [
        {
            "id": "stem",
            "name": "Stem Layer",
            "type": "Standard Convolution",
            "kernel": "3x3",
            "channels_in": 3,
            "channels_out": 32,
            "resolution": "112 x 112",
            "desc": "Detects low-level edge features and initial spatial layouts."
        },
        {
            "id": "stage1",
            "name": "Stage 1 MBConv1",
            "type": "Mobile Inverted Bottleneck",
            "kernel": "3x3",
            "channels_in": 32,
            "channels_out": 16,
            "resolution": "112 x 112",
            "desc": "Depthwise and projection convolutions with squeeze-and-excitation attention weights."
        },
        {
            "id": "stage2",
            "name": "Stage 2 MBConv6",
            "type": "Mobile Inverted Bottleneck",
            "kernel": "3x3",
            "channels_in": 16,
            "channels_out": 24,
            "resolution": "56 x 56",
            "desc": "Resolves multi-channel features at a downscaled spatial resolution."
        },
        {
            "id": "stage3",
            "name": "Stage 3 MBConv6",
            "type": "Mobile Inverted Bottleneck",
            "kernel": "5x5",
            "channels_in": 24,
            "channels_out": 48,
            "resolution": "28 x 28",
            "desc": "Broader receptive field (5x5 kernel) to identify localized patterns like Scratches or Clusters."
        },
        {
            "id": "stage4",
            "name": "Stage 4 MBConv6",
            "type": "Mobile Inverted Bottleneck",
            "kernel": "3x3",
            "channels_in": 48,
            "channels_out": 88,
            "resolution": "14 x 14",
            "desc": "High-level abstract combination layer for localized defect clusters."
        },
        {
            "id": "stage5",
            "name": "Stage 5 MBConv6",
            "type": "Mobile Inverted Bottleneck",
            "kernel": "5x5",
            "channels_in": 88,
            "channels_out": 120,
            "resolution": "14 x 14",
            "desc": "Deep feature combination layer to resolve complex rings (Donuts) and borders."
        },
        {
            "id": "stage6",
            "name": "Stage 6 MBConv6",
            "type": "Mobile Inverted Bottleneck",
            "kernel": "5x5",
            "channels_in": 120,
            "channels_out": 208,
            "resolution": "7 x 7",
            "desc": "Final convolutional stage extracts spatial arrangement maps."
        },
        {
            "id": "head",
            "name": "Final Head & Classifier",
            "type": "Global Average Pooling + Linear Layer",
            "kernel": "Pooling",
            "channels_in": 208,
            "channels_out": 8,
            "resolution": "1 x 1",
            "desc": "Aggregates structural feature dimensions and runs classification mapping logits."
        }
    ]
    
    return {
        "architecture": "EfficientNet-B2",
        "parameters": "7.7M",
        "input_size": "224 x 224 x 3",
        "framework": "PyTorch 2.2+",
        "device": "CUDA / CPU (Auto-selected)",
        "layers": layers
    }
