import React, { useState, useEffect, useRef, Suspense } from 'react'; // Added Suspense
import { Engine, Scene, useScene, SceneLoaderContextProvider } from 'react-babylonjs'; // Added useScene, SceneLoaderContextProvider
import { Vector3, Color3, SceneLoader, AnimationGroup } from '@babylonjs/core'; // Added SceneLoader, AnimationGroup
import '@babylonjs/loaders';
import './App.css';

// Component to load and display the 3D character
const CharacterModel = ({ modelUrl, isSpeaking }) => {
  const scene = useScene();
  const modelRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (scene) {
      const modelFilename = modelUrl.split('/').pop();
      const modelRootUrl = modelUrl.substring(0, modelUrl.lastIndexOf('/') + 1);

      console.log('Attempting to load model:', {
        modelFilename,
        modelRootUrl,
        fullPath: modelUrl
      });

      // Load the GLB file
      SceneLoader.ImportMesh(
        "", // meshNames
        modelRootUrl,
        modelFilename,
        scene,
        (meshes, particleSystems, skeletons, animationGroups) => {
          console.log("Model loaded successfully!", meshes);
          if (meshes.length > 0) {
            const rootMesh = meshes[0];
            modelRef.current = rootMesh;

            // Scale and position the model (adjust scale if needed)
            rootMesh.scaling = new Vector3(10.0, 10.0, 10.0); // Start with larger scale for GLB
            rootMesh.position = new Vector3(0, 0, 0);
            rootMesh.rotate(new Vector3(0, Math.PI, 0), Math.PI); // Face the camera

            // Store animation data (Temporarily disable processing)
            // if (animationGroups && animationGroups.length > 0) {
            //   console.log("Available animations:", animationGroups);
            //   animationRef.current = animationGroups[0]; // Store the talking animation
              
            //   // Stop any playing animations initially
            //   animationGroups.forEach(ag => {
            //     ag.stop();
            //     ag.reset();
            //   });
            // }
          }
        },
        null, // onProgress
        (scene, message, exception) => {
          console.error("Error loading model:", message, exception);
        }
      );
    }

    // Cleanup
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [scene, modelUrl]);

  // Handle speaking state changes (Temporarily disable)
  // useEffect(() => {
  //   if (animationRef.current) {
  //     if (isSpeaking) {
  //       if (!animationRef.current.isPlaying) {
  //         animationRef.current.start(true); // true for looping
  //       }
  //     } else {
  //       if (animationRef.current.isPlaying) {
  //         animationRef.current.stop();
  //         animationRef.current.reset();
  //       }
  //     }
  //   }
  // }, [isSpeaking]);

  return null; // Actual mesh is added to the scene
};


// Main 3D Scene Setup
const CharacterScene = ({ isSpeaking }) => {
  return (
    <>
      <arcRotateCamera
        name="camera1"
        target={new Vector3(0, 1, 0)} // Adjust target slightly upwards
        alpha={Math.PI / 2}
        beta={Math.PI / 2}
        radius={5} // Move camera closer
        lowerRadiusLimit={2}
        upperRadiusLimit={10}
        wheelPrecision={50} // Adjust zoom speed
      />
      <hemisphericLight
        name="light1"
        intensity={0.8} // Slightly brighter light
        direction={Vector3.Up()}
      />
      {/* Add a directional light for better definition */}
      <directionalLight name="dir01" direction={new Vector3(-0.5, -1, 0.5)} intensity={0.5} />

      {/* Use Suspense for fallback while model loads */}
      <Suspense fallback={<box name="loadingBox" size={1} position={new Vector3(0, 1, 0)} />}>
         {/* Context provider is needed for SceneLoader */}
         <SceneLoaderContextProvider>
            <CharacterModel modelUrl="/models/stylized_robot_0_9_max.glb" isSpeaking={isSpeaking} />
         </SceneLoaderContextProvider>
      </Suspense>

      <ground name="ground1" width={6} height={6} subdivisions={2} receiveShadows={true} />
    </>
  );
};

function App() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [statusMessage, setStatusMessage] = useState('Click the button and speak');

  // Refs for Web Speech API
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // --- Web Speech API Setup (STT) ---
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setStatusMessage('Speech recognition not supported by this browser.');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setStatusMessage('Listening...');
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(transcript);
      setStatusMessage(`You said: ${transcript}`);
      // TODO: Send transcript to Gemini API
      handleAiInteraction(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      setStatusMessage(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      if (!userInput && !isSpeaking) { // Reset status if nothing was said and AI isn't speaking
         setStatusMessage('Click the button and speak');
      }
    };
  }, [userInput, isSpeaking]); // Added dependencies

  // --- Handle User Interaction ---
  const handleListen = () => {
    // Stop any ongoing speech synthesis immediately
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false); // Manually update state as onend might not fire immediately after cancel
    }

    // Only prevent starting if already listening
    if (isListening) return;

    setUserInput('');
    setAiResponse('');
    try {
        recognitionRef.current.start();
    } catch (error) {
        setStatusMessage(`Could not start listening: ${error}`);
        setIsListening(false); // Ensure state is correct on error
    }
  };

  // --- Handle AI Interaction ---
  const handleAiInteraction = async (text) => {
    setStatusMessage('Thinking...');
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    if (!apiKey) {
      setStatusMessage('Error: Gemini API key not found. Please check your .env file.');
      speak("Sorry, I'm missing my API key configuration.");
      return;
    }

    // Using v1beta and the suggested model name
    const modelName = 'gemini-2.0-flash-exp'; // Changed from gemini-pro
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Simple text prompt structure
        body: JSON.stringify({
          contents: [{
            parts: [{ text: text }]
          }]
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text(); // Try to get more error details
        throw new Error(`API Error (${response.status}): ${response.statusText}. Body: ${errorBody}`);
      }

      const data = await response.json();

      // Safely access the response text
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiText) {
        setAiResponse(aiText);
        speak(aiText);
      } else {
        console.error("Could not extract text from Gemini response:", data);
        throw new Error("Received an unexpected response format from the AI.");
      }

    } catch (error) {
      console.error("Gemini API Error:", error);
      setStatusMessage(`AI Error: ${error.message}`);
      speak("Sorry, I encountered an error trying to respond."); // Speak an error message
    }
  };

  // --- Web Speech API (TTS) ---
  const speak = (text) => {
    if (synthRef.current.speaking) {
      console.error('SpeechSynthesis.speaking');
      return;
    }
    if (text !== '') {
      const utterThis = new SpeechSynthesisUtterance(text);
      utterThis.onstart = () => {
        setIsSpeaking(true);
        setStatusMessage('Speaking...');
        // TODO: Trigger 'talking' animation
      };
      utterThis.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        setStatusMessage(`Speech synthesis error: ${event.error}`);
        setIsSpeaking(false);
         // TODO: Trigger 'idle' animation
      };
      utterThis.onend = () => {
        setIsSpeaking(false);
        setStatusMessage('Click the button and speak'); // Reset status after speaking
        // TODO: Trigger 'idle' animation
      };
      synthRef.current.speak(utterThis);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Talking Character App</h1>
        <div style={{ height: '400px', width: '100%', border: '1px solid lightgrey', marginBottom: '20px' }}>
          <Engine antialias adaptToDeviceRatio canvasId="babylonJS">
            <Scene>
              <CharacterScene isSpeaking={isSpeaking} />
            </Scene>
          </Engine>
        </div>
        {/* Button is only disabled while listening */}
        <button onClick={handleListen} disabled={isListening}>
          {isListening ? 'Listening...' : 'Push to Talk'}
        </button>
        <p>Status: {statusMessage}</p>
        {userInput && <p>Your Input: {userInput}</p>}
        {aiResponse && <p>AI Response: {aiResponse}</p>}
      </header>
    </div>
  );
}

export default App;
