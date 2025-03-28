import torch
from torch.onnx import export
import os
from torchvision.models import vit_b_16
import warnings
warnings.filterwarnings('ignore')

def convert_pytorch_to_onnx():
    # Create model directory if it doesn't exist
    model_dir = 'assets/model'
    os.makedirs(model_dir, exist_ok=True)
    
    # Create the ViT model architecture
    print("Creating ViT model architecture...")
    model = vit_b_16()
    model.heads = torch.nn.Linear(in_features=768, out_features=2)  # 2 classes
    
    # Load the state dict
    print("Loading model weights...")
    state_dict = torch.load('vit_best_v1.pth', map_location=torch.device('cpu'))
    
    # Fix the state dict keys
    new_state_dict = {}
    for key, value in state_dict.items():
        if key == 'heads.head.weight':
            new_state_dict['heads.weight'] = value
        elif key == 'heads.head.bias':
            new_state_dict['heads.bias'] = value
        else:
            new_state_dict[key] = value
    
    # Load the fixed state dict
    model.load_state_dict(new_state_dict)
    model.eval()
    
    # Create a dummy input tensor with the correct shape
    dummy_input = torch.randn(1, 3, 224, 224)
    
    # Export to ONNX
    print("Converting to ONNX format...")
    export(model, dummy_input, os.path.join(model_dir, 'vit_model.onnx'))
    
    # Create metadata file
    metadata = {
        "input_shape": [1, 3, 224, 224],
        "class_names": {
            "1": "good",
            "2": "bad"
        },
        "normalization": {
            "mean": [0.485, 0.456, 0.406],
            "std": [0.229, 0.224, 0.225]
        }
    }
    
    # Save metadata
    import json
    with open(os.path.join(model_dir, 'model_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print("Conversion complete! Model saved to assets/model/vit_model.onnx")

if __name__ == "__main__":
    convert_pytorch_to_onnx() 