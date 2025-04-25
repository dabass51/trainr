'use client';

import { Card } from "@/components/ui/card"
import { AlertCircle, ThumbsDown, Calendar, Dumbbell, Plus, RefreshCw, SkipForward } from "lucide-react"

interface QuickPromptsProps {
    onPromptSelect: (prompt: string) => void;
    hasExistingUnits: boolean;
}

interface QuickPrompt {
    icon: React.ComponentType;
    title: string;
    prompt: string;
    description: string;
    variant: 'default' | 'warning';
}

const creationPrompts: QuickPrompt[] = [
    {
        icon: Plus,
        title: "New Training Plan 10K run",
        prompt: "Generate a new training plan for a 10K run starting today and ending 4 weeks from today",
        description: "Create a fresh training plan beginning from today",
        variant: 'default'
    },
    {
        icon: Calendar,
        title: "Custom Plan",
        prompt: "Create a personalized training plan based on my profile",
        description: "Generate a plan tailored to your fitness level and goals",
        variant: 'default'
    }
];

const modificationPrompts: QuickPrompt[] = [
    {
        icon: SkipForward,
        title: "Skip Today",
        prompt: `I need to skip today's training (${new Date().toISOString().split('T')[0]}) and reschedule it`,
        description: "Move today's training to another day",
        variant: 'default'
    },
    {
        icon: Dumbbell,
        title: "Easy Mode",
        prompt: "I want an easier version of today's workout",
        description: "Modify today's training to be less intense",
        variant: 'default'
    },
    {
        icon: RefreshCw,
        title: "Refresh Plan",
        prompt: "Update my current training plan to better match my progress",
        description: "Adjust the plan based on your recent performance",
        variant: 'default'
    }
];

export function QuickPrompts({ onPromptSelect, hasExistingUnits }: QuickPromptsProps) {
    const prompts = hasExistingUnits ? modificationPrompts : creationPrompts;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {prompts.map((item, index) => (
                <Card 
                    key={index}
                    className={`p-4 cursor-pointer hover:bg-accent transition-colors
                        ${item.variant === 'warning' ? 'border-orange-200 dark:border-orange-800' : ''}
                    `}
                    onClick={() => onPromptSelect(item.prompt)}
                >
                    <div className="flex items-start space-x-4">
                        <div className={`
                            p-2 rounded-full 
                            ${item.variant === 'warning' 
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                                : 'bg-primary/10 text-primary'
                            }
                        `}>
                            <item.icon />
                        </div>
                        <div>
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
} 