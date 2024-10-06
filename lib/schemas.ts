import { z } from 'zod';

export const TrainingUnitSchema = z.object({
    type: z.string(),
    description: z.string(),
    instruction: z.string(),
    duration: z.number().int().positive(),
    intensity: z.enum(['low', 'medium', 'high']),
    date: z.string().refine((date) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        return dateRegex.test(date);
    }, {
        message: "Invalid date format. Expected YYYY-MM-DD",
    }),
});
