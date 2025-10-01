# 🎨 AI Handwritten Doodle Classifier v1.0

A real-time web application that uses TensorFlow.js to classify hand-drawn doodles into 365 different categories.

## 🌟 Features

- **Real-time Classification**: Instant predictions as you draw
- **365 Categories**: Recognizes a wide variety of objects and concepts
- **Interactive Drawing**: Optimized brush size and smooth drawing experience
- **Mobile Friendly**: Touch support for mobile devices
- **No Backend Required**: Runs entirely in the browser

## 🚀 Live Demo

[Try it live here!](https://yourusername.github.io/doodle-classifier/web-app/)

## 🛠️ Technology Stack

- **Frontend**: HTML5 Canvas, CSS3, Vanilla JavaScript
- **AI/ML**: TensorFlow.js, Keras
- **Model**: Convolutional Neural Network (CNN)
- **Training**: Python, Kaggle Notebooks

## 📊 Model Details

- **Input**: 28x28 grayscale images
- **Architecture**: CNN with convolutional blocks + dense layers
- **Classes**: 365 different object categories
- **Model Size**: ~15MB compressed
- **Inference Time**: ~20-50ms

## 🏃‍♂️ Quick Start

### Option 1: GitHub Pages (Recommended)
1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Set source to `main` branch and `/web-app` folder
4. Visit `https://yourusername.github.io/doodle-classifier/`

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/doodle-classifier.git
cd doodle-classifier

# Serve locally (Python)
cd web-app
python -m http.server 8000

# Or using Node.js
npx serve .

# Open browser
open http://localhost:8000
```

## 🎯 Classes Supported

The model can recognize 365 different categories including:
- **Animals**: cat, dog, elephant, lion, etc.
- **Objects**: car, airplane, house, tree, etc.
- **Food**: apple, pizza, cake, etc.
- **Shapes**: circle, triangle, square, etc.
- And many more!

## 🔧 Development

### File Structure
```
web-app/
├── index.html          # Main HTML file
├── script.js           # Core JavaScript logic
├── style.css           # Styling
├── class_names.txt     # List of 365 class names
└── model/             # TensorFlow.js model files
    ├── model.json
    ├── group1-shard1of2.bin
    └── group1-shard2of2.bin
```

### Key Functions
- `preprocessCanvas()`: Converts canvas drawing to model input
- `predictDrawing()`: Makes predictions using TensorFlow.js
- `displayPredictions()`: Shows top predictions with confidence

## 📈 Model Performance

| Metric | Value |
|--------|-------|
| Model Size | 14.8 MB |
| Inference Time | 20-50ms |
| Input Size | 28x28 pixels |
| Classes | 365 |

## 🎨 Drawing Tips

- Draw simple, recognizable shapes
- Use the full canvas space
- Draw clear, connected lines
- One object per drawing works best

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Quick Draw Dataset** by Google for training data
- **TensorFlow.js** team for the amazing framework

## 📞 Contact

- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Email**: your.email@example.com

---
⭐ If you found this project helpful, please give it a star!