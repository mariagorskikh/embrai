// Import ONNX Runtime Web via CDN (will be included in the HTML)
// const ort = require('onnxruntime-web');

class EmbryoClassifier {
    constructor() {
        this.session = null;
        this.metadata = null;
        this.isModelLoaded = false;
        this.isLoading = false;
        this.statusElement = null;
    }

    async initialize(statusElementId) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.statusElement = document.getElementById(statusElementId);
        this.updateStatus('Loading model metadata...');

        try {
            // Load model metadata
            const metadataResponse = await fetch('/assets/model/model_metadata.json');
            this.metadata = await metadataResponse.json();
            
            this.updateStatus('Loading ONNX model... (this may take a moment)');
            
            // Create inference session
            const sessionOptions = {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all'
            };
            
            this.session = await ort.InferenceSession.create('/assets/model/embryo_model.onnx', sessionOptions);
            
            this.isModelLoaded = true;
            this.isLoading = false;
            this.updateStatus('Model loaded successfully! Ready for inference.');
            
            return true;
        } catch (error) {
            console.error('Model initialization error:', error);
            this.isLoading = false;
            this.updateStatus(`Error loading model: ${error.message}`);
            return false;
        }
    }

    updateStatus(message) {
        if (this.statusElement) {
            this.statusElement.textContent = message;
        }
        console.log(message);
    }

    async classifyImage(imageElement) {
        if (!this.isModelLoaded) {
            this.updateStatus('Model not loaded yet. Please wait.');
            return null;
        }

        this.updateStatus('Processing image...');

        try {
            // Preprocess image
            const tensor = await this.preprocessImage(imageElement);
            
            // Run inference
            const feeds = { input: tensor };
            const results = await this.session.run(feeds);
            
            // Get output
            const output = results.output;
            const scores = Array.from(output.data);
            
            // Find max score index
            const maxScore = Math.max(...scores);
            const maxIndex = scores.indexOf(maxScore);
            
            // Add 1 to match the class indices in metadata (they start from 1)
            const classId = maxIndex + 1;
            const className = this.metadata.class_names[classId];
            
            // Format confidence as percentage
            const confidence = (maxScore * 100).toFixed(2);
            
            this.updateStatus('Classification complete');
            
            return {
                className: className,
                confidence: confidence,
                allScores: scores.map(s => (s * 100).toFixed(2)),
                classNames: this.metadata.class_names
            };
        } catch (error) {
            console.error('Classification error:', error);
            this.updateStatus(`Error during classification: ${error.message}`);
            return null;
        }
    }

    async preprocessImage(imageElement) {
        return new Promise((resolve, reject) => {
            try {
                // Create a canvas to resize the image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Get target dimensions from metadata
                const targetWidth = this.metadata.input_shape[2];
                const targetHeight = this.metadata.input_shape[1];
                
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                
                // Draw and resize image on canvas
                ctx.drawImage(imageElement, 0, 0, targetWidth, targetHeight);
                
                // Get pixel data
                const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;
                
                // Prepare normalized tensor storage
                const inputTensor = new Float32Array(targetWidth * targetHeight * 3);
                
                // Normalization values
                const mean = this.metadata.normalization.mean;
                const std = this.metadata.normalization.std;
                
                // Normalize pixels and convert from RGBA to RGB
                // ONNX models typically expect CHW (Channel, Height, Width) format
                let offset = 0;
                
                // For CHW format (common in PyTorch models)
                for (let c = 0; c < 3; c++) {
                    for (let h = 0; h < targetHeight; h++) {
                        for (let w = 0; w < targetWidth; w++) {
                            const pixel = h * targetWidth + w;
                            const pixelRGBA = pixel * 4;
                            
                            // Normalize with mean and std
                            const normalizedValue = (imageData[pixelRGBA + c] / 255.0 - mean[c]) / std[c];
                            inputTensor[offset++] = normalizedValue;
                        }
                    }
                }
                
                // Create tensor
                const tensor = new ort.Tensor('float32', inputTensor, [1, 3, targetHeight, targetWidth]);
                resolve(tensor);
            } catch (error) {
                reject(error);
            }
        });
    }
}

// Global instance
const embryoClassifier = new EmbryoClassifier(); 