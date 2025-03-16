document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const uploadArea = document.getElementById('uploadArea');
    const uploadContent = document.getElementById('uploadContent');
    const uploadedImage = document.getElementById('uploadedImage');
    const fileUpload = document.getElementById('fileUpload');
    const browseTrigger = document.getElementById('browseTrigger');
    const previewImage = document.getElementById('previewImage');
    const removeImageBtn = document.getElementById('removeImage');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsSection = document.getElementById('resultsSection');
    const analyzedImage = document.getElementById('analyzedImage');
    const annotationOverlay = document.getElementById('annotationOverlay');
    const heatmapToggle = document.getElementById('heatmapToggle');
    const downloadReportBtn = document.getElementById('downloadReport');
    const newAnalysisBtn = document.getElementById('newAnalysis');
    
    // Progress bars and rating elements
    const probabilityBar = document.getElementById('probabilityBar');
    const qualityScore = document.getElementById('qualityScore');
    const implantationProbability = document.getElementById('implantationProbability');
    const cellNumberBar = document.getElementById('cellNumberBar');
    const symmetryBar = document.getElementById('symmetryBar');
    const fragmentationBar = document.getElementById('fragmentationBar');
    const expansionBar = document.getElementById('expansionBar');
    const icmBar = document.getElementById('icmBar');
    const trophectodermBar = document.getElementById('trophectodermBar');
    
    // AI Model elements
    const loadModelBtn = document.getElementById('loadModelBtn');
    const modelStatus = document.getElementById('modelStatus');
    const aiPredictionContainer = document.getElementById('aiPredictionContainer');
    const predictionStatus = document.getElementById('predictionStatus');
    const predictionClass = document.getElementById('predictionClass');
    const predictionConfidence = document.getElementById('predictionConfidence');
    const allScoresContainer = document.getElementById('allScoresContainer');
    
    // Help elements
    const helpBtn = document.getElementById('helpBtn');
    const testingInstructions = document.getElementById('testingInstructions');
    
    let currentFile = null;
    let isAnalyzing = false;
    let isModelLoaded = false;
    
    // Initialize the demo page
    function initDemo() {
        setupDragAndDrop();
        setupEventListeners();
        hideResults();
        hideAiPrediction();
    }
    
    // Set up drag and drop functionality
    function setupDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, unhighlight, false);
        });
        
        uploadArea.addEventListener('drop', handleDrop, false);
    }
    
    // Set up event listeners
    function setupEventListeners() {
        browseTrigger.addEventListener('click', () => fileUpload.click());
        fileUpload.addEventListener('change', handleFileSelect);
        removeImageBtn.addEventListener('click', resetUpload);
        analyzeBtn.addEventListener('click', analyzeImage);
        heatmapToggle.addEventListener('change', toggleHeatmap);
        downloadReportBtn.addEventListener('click', downloadReport);
        newAnalysisBtn.addEventListener('click', resetAnalysis);
        
        // AI Model loading
        loadModelBtn.addEventListener('click', initializeModel);
        
        // Help button
        helpBtn.addEventListener('click', toggleHelpInstructions);
    }
    
    // Initialize the AI model
    async function initializeModel() {
        // Update UI
        document.body.classList.add('model-loading');
        modelStatus.textContent = 'Loading...';
        loadModelBtn.disabled = true;
        
        console.log('Starting model initialization...');
        
        try {
            console.log('Calling embryoClassifier.initialize()...');
            const result = await embryoClassifier.initialize('modelStatus');
            console.log('Initialize result:', result);
            
            if (result) {
                document.body.classList.remove('model-loading');
                document.body.classList.add('model-loaded');
                modelStatus.textContent = 'Ready';
                isModelLoaded = true;
                showAiPrediction();
                console.log('Model successfully loaded and initialized');
            } else {
                throw new Error('Model initialization failed');
            }
        } catch (error) {
            console.error('Detailed model initialization error:', error);
            document.body.classList.remove('model-loading');
            document.body.classList.add('model-error');
            modelStatus.textContent = 'Error: ' + error.message;
            loadModelBtn.disabled = false;
        }
    }
    
    // Prevent default behaviors for drag events
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight the upload area when dragging
    function highlight() {
        uploadArea.classList.add('active');
    }
    
    // Remove highlight from the upload area
    function unhighlight() {
        uploadArea.classList.remove('active');
    }
    
    // Handle file drop
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            handleFiles(files);
        }
    }
    
    // Handle file selection from input
    function handleFileSelect(e) {
        const files = e.target.files;
        if (files.length) {
            handleFiles(files);
        }
    }
    
    // Process the selected files
    function handleFiles(files) {
        const file = files[0];
        
        // Check if file is an image
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds 10MB limit');
            return;
        }
        
        currentFile = file;
        displayImagePreview(file);
        
        // Reset AI prediction when new image is uploaded
        resetPrediction();
    }
    
    // Display image preview
    function displayImagePreview(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            showUploadedImage();
            enableAnalyzeButton();
            
            // If model is loaded, automatically classify the image
            if (isModelLoaded) {
                predictionStatus.textContent = 'Ready to analyze. Click "Analyze Embryo" to begin.';
            }
        };
        
        reader.readAsDataURL(file);
    }
    
    // Show the uploaded image and hide upload content
    function showUploadedImage() {
        uploadContent.style.display = 'none';
        uploadedImage.style.display = 'block';
    }
    
    // Reset the upload process
    function resetUpload() {
        uploadContent.style.display = 'flex';
        uploadedImage.style.display = 'none';
        previewImage.src = '';
        fileUpload.value = '';
        currentFile = null;
        disableAnalyzeButton();
        resetPrediction();
    }
    
    // Reset AI prediction display
    function resetPrediction() {
        predictionStatus.textContent = 'Upload an image and click "Analyze Embryo"';
        predictionClass.textContent = '-';
        predictionConfidence.textContent = '-';
        allScoresContainer.innerHTML = '';
        
        // Remove any success/error classes
        document.body.classList.remove('prediction-success', 'prediction-error');
    }
    
    // Enable the analyze button
    function enableAnalyzeButton() {
        analyzeBtn.classList.add('active');
    }
    
    // Disable the analyze button
    function disableAnalyzeButton() {
        analyzeBtn.classList.remove('active');
    }
    
    // Hide the results section
    function hideResults() {
        resultsSection.classList.remove('active');
    }
    
    // Show the results section
    function showResults() {
        resultsSection.classList.add('active');
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Animate the progress bars
        setTimeout(() => {
            animateProgressBars();
        }, 300);
    }
    
    // Hide AI prediction
    function hideAiPrediction() {
        aiPredictionContainer.classList.remove('active');
    }
    
    // Show AI prediction
    function showAiPrediction() {
        aiPredictionContainer.classList.add('active');
    }
    
    // Analyze the image
    async function analyzeImage() {
        if (!currentFile || isAnalyzing) return;
        
        isAnalyzing = true;
        analyzeBtn.classList.add('loading');
        
        // Copy the image to the results section
        analyzedImage.src = previewImage.src;
        
        // Try to use the AI model if loaded
        if (isModelLoaded) {
            await runAiModelInference();
        }
        
        // Generate simulated results for the demo visualization
        generateSimulatedResults();
        
        // Draw annotation overlay
        drawAnnotationOverlay();
        
        // Show results
        showResults();
        
        // Reset analyze button state
        analyzeBtn.classList.remove('loading');
        isAnalyzing = false;
    }
    
    // Run AI model inference
    async function runAiModelInference() {
        try {
            console.log('Starting AI model inference...');
            predictionStatus.textContent = 'Running AI analysis...';
            
            // Create a new image element for classification
            const img = new Image();
            img.src = previewImage.src;
            console.log('Image source loaded:', img.src.substring(0, 50) + '...');
            
            await new Promise((resolve) => {
                img.onload = () => {
                    console.log('Image loaded successfully. Size:', img.width, 'x', img.height);
                    resolve();
                };
                img.onerror = (err) => {
                    console.error('Error loading image:', err);
                    resolve();
                };
            });
            
            console.log('Calling embryoClassifier.classifyImage()...');
            // Classify the image
            const result = await embryoClassifier.classifyImage(img);
            console.log('Classification result:', result);
            
            if (result) {
                // Update prediction display
                predictionClass.textContent = result.className;
                predictionConfidence.textContent = result.confidence + '%';
                predictionStatus.textContent = 'Analysis complete!';
                
                // Add success class
                document.body.classList.add('prediction-success');
                document.body.classList.remove('prediction-error');
                
                // Display all scores
                console.log('Displaying all scores...');
                displayAllScores(result);
                
                // Adjust the visual results to match the AI prediction
                adjustVisualResultsToMatch(result);
                console.log('AI analysis complete, UI updated');
            } else {
                throw new Error('Classification result is empty');
            }
        } catch (error) {
            console.error('Detailed AI analysis error:', error);
            predictionStatus.textContent = 'Error analyzing image: ' + error.message;
            document.body.classList.add('prediction-error');
            document.body.classList.remove('prediction-success');
        }
    }
    
    // Display all class scores
    function displayAllScores(result) {
        allScoresContainer.innerHTML = '';
        
        // Get the scores and class names
        const scores = result.allScores;
        const classNames = result.classNames;
        const bestClass = result.className;
        
        // Create a score item for each class
        Object.keys(classNames).forEach(classId => {
            const className = classNames[classId];
            const score = parseFloat(scores[classId - 1]); // Adjust for zero-based array
            
            // Ensure score is between 0-100 for display purposes
            const displayScore = Math.max(0, Math.min(100, score)).toFixed(1);
            
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            
            // If this is the best class, add the 'best' class
            if (className === bestClass) {
                scoreItem.classList.add('best');
            }
            
            scoreItem.innerHTML = `
                <span class="class-name">${className}</span>
                <div class="score-bar-container">
                    <div class="score-bar" style="width: ${displayScore}%"></div>
                </div>
                <span class="score-value">${displayScore}%</span>
            `;
            
            allScoresContainer.appendChild(scoreItem);
        });
        
        // Log the sum of all scores to verify normalization (should be close to 100%)
        const totalConfidence = scores.reduce((sum, score) => sum + parseFloat(score), 0).toFixed(1);
        console.log(`Total confidence across all classes: ${totalConfidence}%`);
    }
    
    // Adjust visual results to match AI prediction
    function adjustVisualResultsToMatch(result) {
        const className = result.className;
        
        // Map embryo class to visual characteristics
        switch(className) {
            case '2cell':
                qualityScore.textContent = 'C';
                implantationProbability.textContent = '15%';
                probabilityBar.style.width = '15%';
                document.getElementById('cellNumberRating').textContent = '2';
                cellNumberBar.style.width = '15%';
                break;
                
            case '4cell':
                qualityScore.textContent = 'B';
                implantationProbability.textContent = '35%';
                probabilityBar.style.width = '35%';
                document.getElementById('cellNumberRating').textContent = '4';
                cellNumberBar.style.width = '25%';
                break;
                
            case '8cell':
                qualityScore.textContent = 'B+';
                implantationProbability.textContent = '45%';
                probabilityBar.style.width = '45%';
                document.getElementById('cellNumberRating').textContent = '8';
                cellNumberBar.style.width = '50%';
                break;
                
            case 'morula':
                qualityScore.textContent = 'B';
                implantationProbability.textContent = '50%';
                probabilityBar.style.width = '50%';
                document.getElementById('cellNumberRating').textContent = '16-32';
                cellNumberBar.style.width = '70%';
                break;
                
            case 'blastocyst':
                qualityScore.textContent = 'A';
                implantationProbability.textContent = '68%';
                probabilityBar.style.width = '68%';
                document.getElementById('cellNumberRating').textContent = '70-100';
                cellNumberBar.style.width = '90%';
                break;
        }
    }
    
    // Generate simulated results based on random data
    function generateSimulatedResults() {
        // Quality grades (A, B, C, D) with weighted probabilities
        const grades = ['A', 'B', 'C', 'D'];
        const gradeWeights = [0.4, 0.3, 0.2, 0.1]; // 40% chance for A, 30% for B, etc.
        
        // Generate a random grade based on weights
        const grade = weightedRandom(grades, gradeWeights);
        
        // Implantation probability based on grade
        let probability;
        switch(grade) {
            case 'A': probability = randomRange(65, 85); break;
            case 'B': probability = randomRange(45, 65); break;
            case 'C': probability = randomRange(25, 45); break;
            case 'D': probability = randomRange(10, 25); break;
        }
        
        // Display results if AI model not used
        if (!isModelLoaded) {
            qualityScore.textContent = grade;
            implantationProbability.textContent = `${probability}%`;
            probabilityBar.style.width = `${probability}%`;
            
            // Detail ratings
            const cellNumber = Math.floor(randomRange(4, 16));
            document.getElementById('cellNumberRating').textContent = cellNumber;
            cellNumberBar.style.width = `${(cellNumber / 16) * 100}%`;
        }
        
        // These always get randomized for demo
        const symmetry = (Math.round(randomRange(3.0, 5.0) * 10) / 10).toFixed(1);
        document.getElementById('symmetryRating').textContent = symmetry;
        symmetryBar.style.width = `${(symmetry / 5) * 100}%`;
        
        const fragmentation = Math.floor(randomRange(0, 20));
        document.getElementById('fragmentationRating').textContent = `${fragmentation}%`;
        fragmentationBar.style.width = `${(1 - (fragmentation / 100)) * 100}%`;
        
        const expansion = Math.floor(randomRange(2, 6));
        document.getElementById('expansionRating').textContent = expansion;
        expansionBar.style.width = `${(expansion / 6) * 100}%`;
        
        const icmGrade = weightedRandom(['A', 'B', 'C'], [0.5, 0.3, 0.2]);
        document.getElementById('icmRating').textContent = icmGrade;
        icmBar.style.width = icmGrade === 'A' ? '100%' : (icmGrade === 'B' ? '66%' : '33%');
        
        const teGrade = weightedRandom(['A', 'B', 'C'], [0.4, 0.4, 0.2]);
        document.getElementById('trophectodermRating').textContent = teGrade;
        trophectodermBar.style.width = teGrade === 'A' ? '100%' : (teGrade === 'B' ? '66%' : '33%');
    }
    
    // Draw annotation overlay on the image (simulated)
    function drawAnnotationOverlay() {
        const canvas = annotationOverlay;
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions to match the image container
        const imageContainer = document.querySelector('.image-with-overlay');
        canvas.width = imageContainer.offsetWidth;
        canvas.height = imageContainer.offsetHeight;
        
        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw only if heatmap is enabled
        if (heatmapToggle.checked) {
            drawHeatmap(ctx, canvas.width, canvas.height);
        }
    }
    
    // Draw heatmap overlay (simulated AI focus areas)
    function drawHeatmap(ctx, width, height) {
        // Create a circular gradient at the center
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.35;
        
        // Create gradient
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        
        // Add color stops
        gradient.addColorStop(0, 'rgba(75, 86, 210, 0.6)');
        gradient.addColorStop(0.7, 'rgba(130, 195, 236, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        // Fill with gradient
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add random focal points (simulating AI focus areas)
        const focalPoints = 5;
        for (let i = 0; i < focalPoints; i++) {
            const x = randomRange(width * 0.2, width * 0.8);
            const y = randomRange(height * 0.2, height * 0.8);
            const size = randomRange(10, 30);
            
            const smallGradient = ctx.createRadialGradient(
                x, y, 0,
                x, y, size
            );
            
            smallGradient.addColorStop(0, 'rgba(255, 140, 50, 0.8)');
            smallGradient.addColorStop(1, 'rgba(255, 140, 50, 0)');
            
            ctx.fillStyle = smallGradient;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Toggle heatmap visibility
    function toggleHeatmap() {
        drawAnnotationOverlay();
    }
    
    // Download a simulated PDF report
    function downloadReport() {
        alert('In a full implementation, this would generate and download a PDF report of the analysis.');
    }
    
    // Reset the analysis to start a new one
    function resetAnalysis() {
        resetUpload();
        hideResults();
        
        // Scroll back to upload section
        document.querySelector('.demo-upload').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Animate progress bars when results are shown
    function animateProgressBars() {
        const bars = document.querySelectorAll('.progress-bar');
        bars.forEach(bar => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 100);
        });
    }
    
    // Utility function for weighted random selection
    function weightedRandom(items, weights) {
        const cumulativeWeights = [];
        let sum = 0;
        
        for (let i = 0; i < weights.length; i++) {
            sum += weights[i];
            cumulativeWeights.push(sum);
        }
        
        const random = Math.random() * sum;
        
        for (let i = 0; i < cumulativeWeights.length; i++) {
            if (random <= cumulativeWeights[i]) {
                return items[i];
            }
        }
        
        return items[0]; // Fallback
    }
    
    // Utility function for random range
    function randomRange(min, max) {
        return min + Math.random() * (max - min);
    }
    
    // Toggle help instructions
    function toggleHelpInstructions() {
        console.log('Toggling help instructions');
        if (testingInstructions.style.display === 'none' || !testingInstructions.style.display) {
            testingInstructions.style.display = 'block';
        } else {
            testingInstructions.style.display = 'none';
        }
    }
    
    // Initialize the demo
    initDemo();
}); 