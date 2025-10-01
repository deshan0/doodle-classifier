# 🎨 AI Doodle Classifier

A real-time web app that classifies hand-drawn doodles using TensorFlow.js.

![Demo](docs/demo.gif)

**[🚀 Try Live Demo](https://deshan0.github.io/doodle-classifier/)**

## Features

- Real-time AI predictions as you draw
- 365 object categories 
- Mobile-friendly with touch support
- No backend required

## Run Locally

```bash
git clone https://github.com/deshan0/doodle-classifier.git
cd doodle-classifier
python -m http.server 8000
```

Open `http://localhost:8000`

*Note: Requires local server due to CORS*

## 🛠️ Tech Stack

- **Frontend**: HTML5 Canvas, CSS3, Vanilla JavaScript
- **AI/ML**: TensorFlow.js CNN model (15MB)
- **Dataset**: MNIST, MNIST-FASHION, & Google's Quick Draw (365 classes)
- **Model**: Convolutional Neural Network trained on 28x28 grayscale images

## 📊 Technical Details

- **Input**: 280x280 canvas → preprocessed to 28x28 grayscale
- **Model**: CNN with ~1M parameters
- **Classes**: 365 categories from 3 different datasets
- **Browser Support**: Chrome, Firefox, Safari, Edge (ES6+ required)

## Drawing Tips

- Draw simple, clear shapes
- Use full canvas space
- One object per drawing

Built with ❤️ by [Deshan](https://github.com/deshan0)
