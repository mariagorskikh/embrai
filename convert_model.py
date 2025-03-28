#!/usr/bin/env python3
"""
Convert PyTorch models to ONNX format for web deployment.
This script takes a trained PyTorch model and exports it to ONNX format.
"""

import os
import sys
import torch
import json
import argparse
from timm import create_model

def ensure_dir(directory):
    """Make sure the directory exists."""
    if not os.path.exists(directory):
        os.makedirs(directory)

def export(model, dummy_input, output_path):
    """Export PyTorch model to ONNX."""
    torch.onnx.export(
        model,                    # PyTorch model
        dummy_input,              # Input tensor
        output_path,              # Output file path
        export_params=True,       # Export model parameters
        opset_version=12,         # ONNX opset version
        do_constant_folding=True, # Optimize constant-folding
        input_names=['input'],    # Model input names
        output_names=['output'],  # Model output names
        dynamic_axes={            # Dynamic axes
            'input': {0: 'batch_size'},
            'output': {0: 'batch_size'}
        }
    )

def main():
    """Main function to convert model."""
    parser = argparse.ArgumentParser(description='Convert PyTorch model to ONNX format.')
    parser.add_argument('--model_path', type=str, default='vit_best_v1.pth', 
                        help='Path to the PyTorch model file (.pth)')
    args = parser.parse_args()
    
    # Ensure the model directory exists
    model_dir = os.path.join('assets', 'model')
    ensure_dir(model_dir)
    
    # Load the ViT model
    print(f"Loading model from {args.model_path}...")
    model = create_model('vit_small_patch16_224', pretrained=False, num_classes=5)
    model.load_state_dict(torch.load(args.model_path, map_location='cpu'))
    model.eval()
    
    # Create a dummy input tensor
    dummy_input = torch.randn(1, 3, 224, 224)
    
    # Export to ONNX
    print("Converting to ONNX format...")
    export(model, dummy_input, os.path.join(model_dir, 'embryo_model.onnx'))
    
    # Create metadata
    metadata = {
        "model_name": "Embryo Classification ViT",
        "input_shape": [1, 3, 224, 224],
        "class_names": {
            1: "Grade 1 (Good)",
            2: "Grade 2 (Fair)",
            3: "Grade 3 (Poor)",
            4: "Grade 4 (Degraded)",
            5: "Not an Embryo"
        },
        "normalization": {
            "mean": [0.485, 0.456, 0.406],
            "std": [0.229, 0.224, 0.225]
        }
    }
    
    # Save metadata
    with open(os.path.join(model_dir, 'model_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print("Conversion complete! Model saved to assets/model/embryo_model.onnx")
    print("Metadata saved to assets/model/model_metadata.json")
    return 0

if __name__ == "__main__":
    sys.exit(main()) 