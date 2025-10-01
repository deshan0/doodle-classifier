// Global variables
let model = null;
let classNames = [];
let canvas, ctx;
let isDrawing = false;
let strokes = []; // Store drawing strokes for undo functionality
let currentStroke = [];
let lastX = 0;
let lastY = 0;
let modelLoaded = false;

// Optimized drawing settings
const BRUSH_SIZE = 10; // Fixed optimal brush size
const CANVAS_SIZE = 280; // Canvas size
const MODEL_INPUT_SIZE = 28; // Model input size
const STROKE_STYLE = '#000000'; // Black strokes
const LINE_CAP = 'round';
const LINE_JOIN = 'round';

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing AI Doodle Classifier...');
    
    // Setup canvas and controls
    setupCanvas();
    setupControls();
    
    // Load model and class names in parallel
    const [classNamesResult, modelResult] = await Promise.allSettled([
        loadClassNames(),
        loadModel()
    ]);
    
    if (modelResult.status === 'fulfilled') {
        hideLoadingOverlay();
        updateModelStatus('ready', 'Model Ready');
        modelLoaded = true;
        console.log('✅ Application ready!');
    } else {
        updateModelStatus('error', 'Model Failed');
        console.error('❌ Failed to load model');
    }
});

// Canvas setup and drawing functions
function setupCanvas() {
    canvas = document.getElementById('drawingCanvas');
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Set canvas properties for optimal drawing
    ctx.lineCap = LINE_CAP;
    ctx.lineJoin = LINE_JOIN;
    ctx.lineWidth = BRUSH_SIZE;
    ctx.strokeStyle = STROKE_STYLE;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Initialize canvas
    clearCanvas();
    console.log('🎨 Canvas initialized');
}

function setupControls() {
    // Clear button
    document.getElementById('clearBtn').addEventListener('click', function() {
        clearCanvas();
        clearPredictions();
        console.log('🗑️ Canvas cleared');
    });
    
    // Undo button
    document.getElementById('undoBtn').addEventListener('click', function() {
        undoLastStroke();
        console.log('↶ Undo stroke');
    });
    
    console.log('🎮 Controls initialized');
}

// Drawing functions with optimized stroke handling
function startDrawing(e) {
    isDrawing = true;
    currentStroke = [];
    [lastX, lastY] = getMousePos(e);
    
    // Start new path
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    
    // Add point to current stroke
    currentStroke.push({ x: lastX, y: lastY });
}

function draw(e) {
    if (!isDrawing) return;
    
    const [currentX, currentY] = getMousePos(e);
    
    // Draw smooth line
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    
    // Add point to current stroke
    currentStroke.push({ x: currentX, y: currentY });
    
    [lastX, lastY] = [currentX, currentY];
}

function stopDrawing() {
    if (!isDrawing) return;
    
    isDrawing = false;
    
    // Save completed stroke
    if (currentStroke.length > 0) {
        strokes.push([...currentStroke]);
        currentStroke = [];
    }
    
    // Trigger prediction after a short delay
    setTimeout(() => {
        if (modelLoaded && !isCanvasEmpty()) {
            predictDrawing();
        }
    }, 300);
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return [
        (e.clientX - rect.left) * scaleX,
        (e.clientY - rect.top) * scaleY
    ];
}

// Touch event handlers
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function handleTouchEnd(e) {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
}

// Canvas utility functions
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Reset stroke data
    strokes = [];
    currentStroke = [];
    
    // Reset drawing style
    ctx.strokeStyle = STROKE_STYLE;
    ctx.lineWidth = BRUSH_SIZE;
}

function undoLastStroke() {
    if (strokes.length === 0) return;
    
    // Remove last stroke
    strokes.pop();
    
    // Redraw canvas
    redrawCanvas();
    
    // Re-predict if canvas is not empty
    setTimeout(() => {
        if (modelLoaded && !isCanvasEmpty()) {
            predictDrawing();
        } else if (isCanvasEmpty()) {
            clearPredictions();
        }
    }, 100);
}

function redrawCanvas() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all strokes
    ctx.strokeStyle = STROKE_STYLE;
    ctx.lineWidth = BRUSH_SIZE;
    
    strokes.forEach(stroke => {
        if (stroke.length < 2) return;
        
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        
        for (let i = 1; i < stroke.length; i++) {
            ctx.lineTo(stroke[i].x, stroke[i].y);
        }
        
        ctx.stroke();
    });
}

function isCanvasEmpty() {
    return strokes.length === 0;
}

// Optimized image preprocessing using TensorFlow.js (DoodleNet approach)
function preprocessCanvas() {
    try {
        // Create tensor directly from canvas using TF.js
        let tensor = tf.browser.fromPixels(canvas, 1); // Grayscale
        
        // Resize to model input size using bicubic interpolation for better quality
        tensor = tf.image.resizeBilinear(tensor, [MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);
        
        // Add batch dimension [1, 28, 28, 1]
        tensor = tensor.expandDims(0);
        
        // Normalize to [0, 1] range
        tensor = tensor.div(255.0);
        
        // Invert colors: black drawing on white background -> white drawing on black background
        tensor = tf.sub(1.0, tensor);
        
        return tensor;
        
    } catch (error) {
        console.error('❌ Error preprocessing canvas:', error);
        throw error;
    }
}

// Model loading functions
async function loadModel() {
    try {
        console.log('🔄 Loading TensorFlow.js model...');
        updateModelStatus('loading', 'Loading Model...');
        
        // Load model with error handling
        model = await tf.loadLayersModel('./model/model.json');
        
        console.log('✅ Model loaded successfully!');
        console.log('📊 Model input shape:', model.inputs[0].shape);
        console.log('📊 Model output shape:', model.outputs[0].shape);
        
        // Warm up the model with a dummy prediction
        const dummyInput = tf.zeros([1, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, 1]);
        const warmupPrediction = model.predict(dummyInput);
        warmupPrediction.dispose();
        dummyInput.dispose();
        
        console.log('🔥 Model warmed up');
        return true;
        
    } catch (error) {
        console.error('❌ Error loading model:', error);
        updateModelStatus('error', 'Model Load Failed');
        throw error;
    }
}

async function loadClassNames() {
    try {
        console.log('🔄 Loading class names...');
        
        const response = await fetch('./class_names.txt');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        const lines = text.trim().split('\n').filter(line => line.trim());
        
        classNames = [];
        
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            // Handle "index: name" format
            const colonIndex = trimmedLine.indexOf(': ');
            if (colonIndex !== -1) {
                const name = trimmedLine.substring(colonIndex + 2).trim();
                classNames.push(name);
            }
            // Handle just names
            else if (trimmedLine && !trimmedLine.match(/^\d+$/)) {
                classNames.push(trimmedLine);
            }
            // Handle just numbers - use default names
            else {
                classNames.push(getDefaultClassName(index));
            }
        });
        
        // Fallback to default names if parsing failed
        if (classNames.length === 0) {
            console.log('⚠️ Using default class names');
            classNames = getDefaultClassNames();
        }
        
        console.log(`✅ Loaded ${classNames.length} class names`);
        console.log('📝 Sample classes:', classNames.slice(0, 5));
        
        return true;
        
    } catch (error) {
        console.error('❌ Error loading class names:', error);
        console.log('⚠️ Using default class names as fallback');
        classNames = getDefaultClassNames();
        return false;
    }
}

function getDefaultClassName(index) {
    const defaultNames = [
        'airplane', 'alarm clock', 'ambulance', 'angel', 'ant', 'apple', 'backpack', 'banana', 'basketball', 'bat',
        'bear', 'bicycle', 'bird', 'book', 'bowtie', 'bread', 'butterfly', 'cactus', 'cake', 'calculator',
        'camel', 'camera', 'candle', 'car', 'carrot', 'castle', 'cat', 'chair', 'church', 'circle',
        'clock', 'cloud', 'coffee cup', 'computer', 'cookie', 'cow', 'crab', 'crocodile', 'cup', 'diamond',
        'dog', 'dolphin', 'donut', 'door', 'dragon', 'duck', 'ear', 'elephant', 'eye', 'face',
        'fan', 'feather', 'fire', 'fish', 'flower', 'frog', 'giraffe', 'guitar', 'hammer', 'hat',
        'heart', 'hedgehog', 'helicopter', 'horse', 'house', 'ice cream', 'kangaroo', 'key', 'knife', 'ladder',
        'laptop', 'leaf', 'lightning', 'lion', 'lobster', 'lollipop', 'microphone', 'monkey', 'moon', 'mountain',
        'mouse', 'mushroom', 'octopus', 'owl', 'paintbrush', 'palm tree', 'panda', 'penguin', 'piano', 'pig',
        'pizza', 'rabbit', 'rainbow', 'rhinoceros', 'rifle', 'river', 'sailboat', 'sandwich', 'saw', 'scissors'
    ];
    
    return defaultNames[index] || `Object ${index}`;
}

function getDefaultClassNames() {
    const names = [];
    for (let i = 0; i < 365; i++) {
        names.push(getDefaultClassName(i));
    }
    return names;
}

// Prediction functions
async function predictDrawing() {
    if (!model || !modelLoaded || classNames.length === 0) {
        console.log('⚠️ Model or class names not ready');
        return;
    }
    
    try {
        const startTime = performance.now();
        console.log('🔄 Starting prediction...');
        
        // Preprocess canvas
        const inputTensor = preprocessCanvas();
        console.log('📊 Input tensor shape:', inputTensor.shape);
        
        // Get tensor statistics for debugging
        const stats = {
            min: inputTensor.min().dataSync()[0],
            max: inputTensor.max().dataSync()[0],
            mean: inputTensor.mean().dataSync()[0]
        };
        console.log('📊 Input stats:', stats);
        
        // Make prediction
        const predictions = model.predict(inputTensor);
        const probabilities = await predictions.data();
        
        // Calculate processing time
        const processingTime = Math.round(performance.now() - startTime);
        console.log(`⚡ Prediction completed in ${processingTime}ms`);
        
        // Clean up tensors
        inputTensor.dispose();
        predictions.dispose();
        
        // Get top predictions
        const topPredictions = getTopPredictions(Array.from(probabilities), 10);
        console.log('🏆 Top predictions:', topPredictions.slice(0, 3));
        
        // Update UI
        displayPredictions(topPredictions);
        updatePredictionStats(topPredictions[0]?.confidence || 0, processingTime);
        
    } catch (error) {
        console.error('❌ Prediction error:', error);
        displayPredictions([{
            className: '❌ Prediction Error',
            confidence: 0
        }]);
    }
}

function getTopPredictions(probabilities, topK = 10) {
    // Create array of {index, probability} pairs
    const indexed = probabilities.map((prob, index) => ({ index, prob }));
    
    // Sort by probability (descending)
    indexed.sort((a, b) => b.prob - a.prob);
    
    // Get top K predictions
    return indexed.slice(0, topK).map(item => ({
        className: classNames[item.index] || `Class ${item.index}`,
        confidence: item.prob
    })).filter(pred => pred.confidence > 0.001); // Filter very low confidence
}

// UI update functions
function displayPredictions(predictions) {
    const container = document.getElementById('predictionsContainer');
    container.innerHTML = '';
    
    if (predictions.length === 0) {
        container.innerHTML = `
            <div class="prediction-item placeholder">
                <span class="label">No confident predictions</span>
            </div>
        `;
        return;
    }
    
    predictions.forEach((pred, index) => {
        const item = document.createElement('div');
        item.className = 'prediction-item';
        if (index === 0) item.classList.add('top-prediction');
        
        const percentage = (pred.confidence * 100).toFixed(1);
        const displayName = pred.className.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        item.innerHTML = `
            <span class="rank">${index + 1}.</span>
            <span class="label">${displayName}</span>
            <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${percentage}%"></div>
            </div>
            <span class="percentage">${percentage}%</span>
        `;
        
        container.appendChild(item);
    });
}

function clearPredictions() {
    const container = document.getElementById('predictionsContainer');
    container.innerHTML = `
        <div class="prediction-item placeholder">
            <span class="label">Start drawing!</span>
        </div>
    `;
    
    // Hide stats
    document.getElementById('predictionStats').style.display = 'none';
}

function updatePredictionStats(confidence, processingTime) {
    document.getElementById('topConfidence').textContent = `${(confidence * 100).toFixed(1)}%`;
    document.getElementById('processingTime').textContent = `${processingTime}ms`;
    document.getElementById('predictionStats').style.display = 'flex';
}

function updateModelStatus(status, message) {
    const indicator = document.querySelector('.status-indicator');
    const text = document.querySelector('.status-text');
    
    indicator.className = `status-indicator ${status}`;
    text.textContent = message;
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Memory management
// Replace the problematic cleanupTensors function
function cleanupTensors() {
    const memory = tf.memory();
    
    // Only clean up if we have excessive tensors
    if (memory.numTensors > 100) {
        console.log('🧹 Cleaning up tensor memory...');
        
        // Use gentler cleanup - don't dispose model variables
        tf.engine().startScope();
        tf.engine().endScope();
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }
}

// Better: Clean up specific tensors after each prediction
async function predictDrawing() {
    if (!model || !modelLoaded || classNames.length === 0) {
        console.log('⚠️ Model or class names not ready');
        return;
    }
    
    let inputTensor = null;
    let predictions = null;
    
    try {
        const startTime = performance.now();
        console.log('🔄 Starting prediction...');
        
        // Preprocess canvas
        inputTensor = preprocessCanvas();
        console.log('📊 Input tensor shape:', inputTensor.shape);
        
        // Get tensor statistics for debugging
        const stats = {
            min: inputTensor.min().dataSync()[0],
            max: inputTensor.max().dataSync()[0],
            mean: inputTensor.mean().dataSync()[0]
        };
        console.log('📊 Input stats:', stats);
        
        // Make prediction
        predictions = model.predict(inputTensor);
        const probabilities = await predictions.data();
        
        // Calculate processing time
        const processingTime = Math.round(performance.now() - startTime);
        console.log(`⚡ Prediction completed in ${processingTime}ms`);
        
        // Get top predictions
        const topPredictions = getTopPredictions(Array.from(probabilities), 10);
        console.log('🏆 Top predictions:', topPredictions.slice(0, 3));
        
        // Update UI
        displayPredictions(topPredictions);
        updatePredictionStats(topPredictions[0]?.confidence || 0, processingTime);
        
    } catch (error) {
        console.error('❌ Prediction error:', error);
        displayPredictions([{
            className: '❌ Prediction Error',
            confidence: 0
        }]);
    } finally {
        // ✅ Always clean up tensors in finally block
        if (inputTensor) inputTensor.dispose();
        if (predictions) predictions.dispose();
    }
}

// Periodic cleanup
setInterval(cleanupTensors, 30000); // Clean up every 30 seconds

// Debug function to log tensor memory usage
function logMemoryUsage() {
    const memory = tf.memory();
    console.log('📊 Memory usage:', {
        numTensors: memory.numTensors,
        numDataBuffers: memory.numDataBuffers,
        numBytes: memory.numBytes
    });
}

// Export for debugging
window.debugModel = {
    logMemoryUsage,
    preprocessCanvas,
    classNames: () => classNames,
    model: () => model
};