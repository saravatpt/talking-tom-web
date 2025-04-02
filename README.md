# Talking Tom AI

An interactive web application featuring a 3D animated character that responds to voice input using Google's Gemini AI. The character listens to user speech, processes it through the Gemini AI API, and responds with synthesized speech while displaying the 3D model.

## Features

- **Voice Interaction**: Uses Web Speech API for speech-to-text and text-to-speech functionality
- **AI Integration**: Powered by Google's Gemini AI for natural conversation
- **3D Visualization**: Renders a 3D character model using Babylon.js
- **Responsive Design**: Works on both desktop and mobile browsers
- **Real-time Interaction**: Immediate voice responses with the ability to interrupt and start new queries

## Technologies Used

- React (Create React App)
- Babylon.js for 3D rendering
- Google Gemini AI API
- Web Speech API (Speech Recognition & Speech Synthesis)
- Environment variables for secure API key management

## Prerequisites

Before running this project, you need:

1. Node.js and npm installed
2. A Google Gemini AI API key
3. A modern web browser that supports the Web Speech API

## Setup

1. Clone the repository:
```bash
git clone https://github.com/saravatpt/talking-tom-web.git
cd talking-tom-web
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root and add your Gemini API key:
```
REACT_APP_GEMINI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) to view it in your browser

## Usage

1. Allow microphone access when prompted by your browser
2. Click the "Push to Talk" button
3. Speak your message
4. Wait for the AI to process and respond through the 3D character
5. To interrupt the AI's response and ask a new question, click "Push to Talk" again

## Development Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
talking-tom-web/
  ├── public/
  │   └── models/        # 3D model files
  ├── src/
  │   ├── App.js        # Main application logic
  │   ├── App.css       # Styles
  │   └── index.js      # Entry point
  ├── .env              # Environment variables (not in repo)
  └── package.json      # Dependencies and scripts
```

## Security Notes

- The Gemini API key is stored in a `.env` file which is not committed to the repository
- The `.gitignore` file ensures sensitive information is not exposed
- Always use environment variables for API keys and secrets

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- 3D model source: [Stylized Robot Model from Sketchfab](https://sketchfab.com)
- Create React App for the initial project setup
- Babylon.js community for 3D rendering capabilities
- Google's Gemini AI platform for natural language processing
