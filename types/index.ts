export type Tool = {
    name: string;
    description: string;
    parameters: ToolParameter[];
};

export type ToolParameter = {
    name: string;
    parameterName: string;
    description: string;
    type: string;
    required: boolean;
};

export type FunctionParameter = {
    parameterName: string;
    parameterValue: string;
};

export type TrainingUnit = {
    id: string;
    userId: string;
    type: string;
    description: string;
    instruction: string;
    duration: number;
    intensity: 'low' | 'medium' | 'high';
    date: string; // ISO date string
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type RescheduleRequest = {
    userId: string;
    conflictingDates: Date[];
    endDate: Date;
    reason?: string;
}
