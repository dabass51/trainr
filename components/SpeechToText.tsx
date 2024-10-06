import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

interface SpeechToTextProps {
    onTranscript: (transcript: string) => void;
}

declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

type SpeechRecognition = typeof window.webkitSpeechRecognition;

type SpeechRecognitionEvent = {
    resultIndex: number;
    results: {
        [index: number]: {
            0: {
                transcript: string;
            };
        };
    };
};

type SpeechRecognitionErrorEvent = {
    error: string;
};

const SpeechToText: React.FC<SpeechToTextProps> = ({ onTranscript }) => {
    const [isListening, setIsListening] = useState<boolean>(false);
    const [transcript, setTranscript] = useState<string>('');
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognitionInstance = new window.webkitSpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;

            recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
                const current = event.resultIndex;
                const resultTranscript = event.results[current][0].transcript;
                setTranscript(resultTranscript);
                onTranscript(resultTranscript);
            };

            recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            setRecognition(recognitionInstance);
        } else {
            console.log('Speech recognition not supported');
        }
    }, [onTranscript]);

    const toggleListening = useCallback(() => {
        if (recognition) {
            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
            }
            setIsListening(!isListening);
        }
    }, [isListening, recognition]);

    return (

        <Button
            onClick={toggleListening}
            className={`${isListening ? 'bg-red-500' : ''}`}
        >
            {isListening ? <MicOff /> : <Mic />}
        </Button>

    );
};

export default SpeechToText;
