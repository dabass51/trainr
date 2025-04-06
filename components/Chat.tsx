import React, { useState } from 'react';
import SpeechToText from '@/components/SpeechToText';
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"


interface ChatProps {
    onGeneratePlan: (prompt: string) => void;
    disabled?: boolean;
}

const Chat: React.FC<ChatProps> = ({ onGeneratePlan, disabled = false }) => {
    const [prompt, setPrompt] = useState('');

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGeneratePlan(prompt);
        setPrompt(''); // Clear input after submitting
    };

    const handleSpeechInput = (transcript: string) => {
        setPrompt(transcript);
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="">
                <Textarea
                    value={prompt}
                    onChange={handlePromptChange}
                    placeholder="Enter your request here (e.g., 'Generate a 7-day training plan')"
                    disabled={disabled}
                />
                <div className="flex justify-end space-x-2 mt-4">
                    <SpeechToText 
                        onTranscript={handleSpeechInput}
                        disabled={disabled}
                    />
                    <Button
                        type="submit"
                        disabled={!prompt || disabled}
                        className="ml-5"
                    >
                        {disabled ? 'Generating Plan...' : 'Submit Prompt'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Chat;
