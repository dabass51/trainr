'use client';

import { Card } from "@/components/ui/card"
import { AlertCircle, ThumbsDown, Calendar, Dumbbell } from "lucide-react"

interface QuickPromptsProps {
    onPromptSelect: (prompt: string) => void;
}

interface QuickPrompt {
    icon: React.ComponentType;
    title: string;
    prompt: string;
    description: string;
    variant: 'default' | 'warning';
}

const quickPrompts: QuickPrompt[] = [
    {
        icon: Calendar,
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
        icon: Calendar,
        title: "New Training Plan",
        prompt: "Generate a new training plan starting today",
        description: "Create a fresh training plan beginning from today",
        variant: 'default'
    }
];

export function QuickPrompts({ onPromptSelect }: QuickPromptsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {quickPrompts.map((item, index) => (
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