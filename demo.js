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
    
    let currentFile = null;
    let isAnalyzing = false;
    
    // Initialize the demo page
    function initDemo() {
        setupDragAndDrop();
        setupEventListeners();
        hideResults();
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
    }
    
    // Display image preview
    function displayImagePreview(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            showUploadedImage();
            enableAnalyzeButton();
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
    
    // Analyze the image (simulated for now)
    function analyzeImage() {
        if (!currentFile || isAnalyzing) return;
        
        isAnalyzing = true;
        analyzeBtn.classList.add('loading');
        
        // Copy the image to the results section
        analyzedImage.src = previewImage.src;
        
        // Simulate analysis time (3 seconds)
        setTimeout(() => {
            // Generate simulated results
            generateSimulatedResults();
            
            // Draw annotation overlay
            drawAnnotationOverlay();
            
            // Show results
            showResults();
            
            // Reset analyze button state
            analyzeBtn.classList.remove('loading');
            isAnalyzing = false;
        }, 3000);
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
        
        // Display results
        qualityScore.textContent = grade;
        implantationProbability.textContent = `${probability}%`;
        probabilityBar.style.width = `${probability}%`;
        
        // Detail ratings
        const cellNumber = Math.floor(randomRange(4, 16));
        document.getElementById('cellNumberRating').textContent = cellNumber;
        cellNumberBar.style.width = `${(cellNumber / 16) * 100}%`;
        
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
    
    // Initialize the demo
    initDemo();
}); 