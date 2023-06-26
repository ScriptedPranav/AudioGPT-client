import { Box, Button, Center, Textarea, useColorMode, Spinner ,Text} from "@chakra-ui/react";
import { BsMoon, BsSun } from "react-icons/bs";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import url from './utils/axiosUrl';

function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    resetTranscript,
    isMicrophoneAvailable,
  } = useSpeechRecognition();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const transcriptRef = useRef("");
  const isTranscriptChangedRef = useRef(false);

  const processVoiceInput = async (input:string) => {
    try {
      const response = await axios.post(url, {
        input: input,
      });
      const data = await response?.data;
      setAudioUrl(data.audioUrl);
    } catch (error) {
      console.error("Error processing voice input", error);
    }
  };

  useEffect(() => {
    if (!listening && isTranscriptChangedRef.current) {
      processVoiceInput(transcriptRef.current);
      setLoading(false);
      isTranscriptChangedRef.current = false;
    }
  }, [listening]);

  useEffect(() => {
    if (transcript !== transcriptRef.current) {
      transcriptRef.current = transcript;
      isTranscriptChangedRef.current = true;
    }
  }, [transcript]);

  const handleButtonClick = async () => {
    if (listening) {
      resetTranscript();
      SpeechRecognition.stopListening();
    } else {
      setLoading(true);
      await SpeechRecognition.startListening({ language: "en-US" });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <div>Browser does not support speech recognition</div>;
  }

  if (!isMicrophoneAvailable) {
    return <div>Microphone not available</div>;
  }

  return (
    <Center height="100vh">
      <Box
        bg={colorMode === "light" ? "gray.100" : "gray.800"}
        p={4}
        borderRadius="md"
      >
        <Textarea
          placeholder="Speak your query..."
          value={transcript}
          bg={colorMode === "light" ? "white" : "gray.700"}
          resize="none"
          mb={4}
          readOnly
        />
        <Button onClick={handleButtonClick}>
          {listening ? "Stop" : "Start"}
        </Button>
        <Button onClick={toggleColorMode} ml={2}>
          {colorMode === "light" ? <BsMoon /> : <BsSun />}
        </Button>
        {audioUrl ? (
          <audio src={audioUrl} controls />
        ) : (
          <p>Press <Text as = 'mark'>start</Text> to get the response audio</p>
        )}
      </Box>
    </Center>
  );
}

export default App;
