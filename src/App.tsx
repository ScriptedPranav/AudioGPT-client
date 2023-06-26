import { Box, Button, Center, Textarea, useColorMode, Spinner, Text } from "@chakra-ui/react";
import { BsMoon, BsSun } from "react-icons/bs";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
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

  const processVoiceInput = async (input: string) => {
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
    <Center height="100vh" bg={colorMode === "light" ? "gray.200" : "gray.900"}>
      <Box
        maxW="md"
        p={8}
        borderRadius="md"
        boxShadow="lg"
        bg={colorMode === "light" ? "white" : "gray.700"}
      >
        <Box
          bgGradient="linear(to-r, blue.400, purple.500)"
          bgClip="text"
          fontSize="2xl"
          fontWeight="semibold"
          textAlign="center"
          mb={4}
        >
          GPT-Powered Audio-BOT
        </Box>
        <Text fontSize="md" textAlign="center" mb={4} color={colorMode === "light" ? "gray.500" : "gray.400"}>
          Speak your query and get an audio response
        </Text>
        <Textarea
          placeholder="Speak your query..."
          value={transcript}
          resize="none"
          mb={4}
          readOnly
          minHeight="10rem"
          borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
          _hover={{ borderColor: colorMode === "light" ? "gray.400" : "gray.500" }}
          _focus={{ borderColor: colorMode === "light" ? "blue.500" : "blue.300" }}
          borderRadius="md"
          bg={colorMode === "light" ? "white" : "gray.600"}
          color={colorMode === "light" ? "gray.800" : "white"}
        />
        <Button
          onClick={handleButtonClick}
          colorScheme={colorMode === "light" ? "blue" : "teal"}
          size="md"
          fontWeight="semibold"
        >
          {listening ? "Stop" : "Start"}
        </Button>
        <Button
          onClick={toggleColorMode}
          ml={2}
          colorScheme={colorMode === "light" ? "blue" : "teal"}
          size="md"
          fontWeight="semibold"
        >
          {colorMode === "light" ? <BsMoon /> : <BsSun />}
        </Button>
        {audioUrl ? (
          <audio src={audioUrl} controls style={{ marginTop: "1rem" }} />
        ) : (
          <Text fontSize="sm" textAlign="center" color={colorMode === "light" ? "gray.500" : "gray.400"}>
            Press Start to get the response audio
          </Text>
        )}
        {loading && (
          <Center mt={4}>
            <Spinner size="sm" color={colorMode === "light" ? "blue.500" : "teal.300"} />
          </Center>
        )}
      </Box>
    </Center>
  );
}

export default App;
