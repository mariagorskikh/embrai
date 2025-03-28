#!/usr/bin/env python3
"""
Download model files for EmbrAI application.
This script automatically downloads the ONNX model files needed by the application.
"""

import os
import sys
import requests
from tqdm import tqdm
import shutil

# URLs for model files (replace with your actual hosted URLs)
MODEL_URLS = {
    "embryo_model.onnx": "https://storage.googleapis.com/embrai-models/embryo_model.onnx",
    # Add other model files as needed
}

def ensure_dir(directory):
    """Make sure the directory exists."""
    if not os.path.exists(directory):
        os.makedirs(directory)

def download_file(url, destination):
    """Download a file with progress bar."""
    with requests.get(url, stream=True) as response:
        response.raise_for_status()
        total_size = int(response.headers.get('content-length', 0))
        
        # Show progress bar
        with tqdm(total=total_size, unit='B', unit_scale=True, desc=os.path.basename(destination)) as progress_bar:
            with open(destination, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        progress_bar.update(len(chunk))
    
    return destination

def main():
    """Main function to download model files."""
    print("Downloading EmbrAI model files...")
    
    # Ensure the model directory exists
    model_dir = os.path.join('assets', 'model')
    ensure_dir(model_dir)
    
    # Download each model file
    for filename, url in MODEL_URLS.items():
        destination = os.path.join(model_dir, filename)
        
        # Skip if file already exists
        if os.path.exists(destination):
            print(f"{filename} already exists, skipping...")
            continue
        
        print(f"Downloading {filename}...")
        try:
            download_file(url, destination)
            print(f"Successfully downloaded {filename}")
        except Exception as e:
            print(f"Error downloading {filename}: {e}")
            return 1
    
    print("All model files downloaded successfully!")
    return 0

if __name__ == "__main__":
    sys.exit(main()) 