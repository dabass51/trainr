import {prisma} from '@/lib/prisma';
import {TrainingUnitSchema} from '@/lib/schemas'
import {Tool,ToolParameter,FunctionParameter,TrainingUnit,RescheduleRequest} from '@/types/index'
import OpenAI from 'openai';



const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

const getCurrentDateInYYYYMMDD = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getTomorrowDateInYYYYMMDD = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Add one day to today's date
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(tomorrow.getDate()).padStart(2, '0'); // Ensure two digits for day

    return `${year}-${month}-${day}`;
};


async function EditTrainingUnitByDate(userId: string, date: string, updates: Partial<TrainingUnit>) {
    const profile = await prisma.profile.findUnique({
        where: { userId: userId },
    });

    if (!profile) {
        throw new Error('User profile not found');
    }

    const existingUnit = await prisma.trainingUnit.findFirst({
        where: {
            date: date,
            userId: userId,
        },
    });

    if (!existingUnit) {
        throw new Error('Training unit not found or does not belong to the user.');
    }

    // Handle different modification scenarios
    let modifiedUnit = { ...existingUnit, ...updates };

    // Scenario: Feeling unwell - make training lighter
    if (updates.intensity === 'low' && existingUnit.intensity !== 'low') {
        // Reduce duration by 20-30%
        modifiedUnit.duration = Math.floor(existingUnit.duration * 0.7);
        // Add a note about recovery
        modifiedUnit.instruction = `⚠️ Recovery Session\n\n${existingUnit.instruction}\n\nNote: This session has been modified for recovery. Focus on maintaining good form and listen to your body.`;
    }

    // Scenario: Changing sport type
    if (updates.type && updates.type !== existingUnit.type) {
        // Ensure the new type is in preferred disciplines
        if (!profile.preferredDisciplines.includes(updates.type)) {
            throw new Error('New training type must be one of your preferred disciplines');
        }
        // Update instruction to reflect new sport
        modifiedUnit.instruction = `🔄 Cross-Training Session\n\n${existingUnit.instruction}\n\nNote: This session has been adapted for ${updates.type}. Maintain similar effort levels and focus on proper technique.`;
    }

    // Scenario: Complete rest day
    if (updates.type === 'rest') {
        modifiedUnit = {
            ...existingUnit,
            type: 'rest',
            description: 'Rest Day',
            instruction: '🛌 Rest Day\n\nTake a complete rest day to allow your body to recover. Focus on:\n- Hydration\n- Nutrition\n- Light stretching if needed\n- Good sleep',
            duration: 0,
            intensity: 'low'
        };
    }

    const updatedUnit = await prisma.trainingUnit.update({
        where: {
            id: existingUnit.id,
        },
        data: modifiedUnit,
    });

    return updatedUnit;
}

async function GetTrainingUnitForDay(userId: string, date: string) {
    if (!isValidDate(date)) {
        throw new Error('Invalid date format. Please use YYYY-MM-DD.');
    }

    const startOfDay = new Date(`${date} 00:00:00.000`).toISOString();
    const endOfDay = new Date(`${date} 23:59:59.999`).toISOString();

    const units = await prisma.trainingUnit.findMany({
        where: {
            userId: userId,
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    return units;
}

async function GetTrainingUnitsForRange(userId: string, startDate: string, endDate: string) {
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        throw new Error('Invalid date format. Please use YYYY-MM-DD for both start and end dates.');
    }

    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    if (start > end) {
        throw new Error('Start date must be before or equal to end date.');
    }

    const units = await prisma.trainingUnit.findMany({
        where: {
            userId: userId,
            date: {
                gte: start,
                lte: end,
            },
        },
    });

    return units;
}

const generateTrainingPlanTool: Tool = {
    name: "GenerateTrainingPlan",
    description: "Generate a training plan for a user based on their profile for a specified time range",
    parameters: [
        {
            name: "startDate",
            parameterName: "startDate",
            description: "startdate for the trainingsplan (in YYYY-MM-DD format). if no startdate can be extracted leave empty",
            type: "string",
            required: false,
        },
        {
            name: "endDate",
            parameterName: "endDate",
            description: "Enddate of the training plan (in YYYY-MM-DD format). if no endDate can be extracted leave empty",
            type: "string",
            required: false,
        },
    ],
};


const rescheduleTrainingPlanTool: Tool = {
    name: "rescheduleTrainingPlan",
    description: "Reschedule a user's training plan to accommodate conflicts while maintaining the overall training goals and end date. This tool should analyze the current plan, identify affected units, and intelligently decide whether to move, cancel, or adjust training units based on the conflict and training priorities.",
    parameters: [
        {
            name: "conflictingDateStart",
            parameterName: "conflictingDateStart",
            description: "Start date of the period where the original training plan cannot be followed (in YYYY-MM-DD format). If not provided, assume it's the current date.",
            type: "string",
            required: true,
        },
        {
            name: "conflictingDateEnd",
            parameterName: "conflictingDateEnd",
            description: "End date of the period where the original training plan cannot be followed (in YYYY-MM-DD format). If not provided, assume it's the same as the start date.",
            type: "string",
            required: true,
        },
        {
            name: "reason",
            parameterName: "reason",
            description: "The reason for the change, which should influence the rescheduling strategy. Options are: 'canceled' (remove affected units), 'postponed' (move affected units), or 'changed' (adjust affected units or surrounding plan).",
            type: "string",
            required: true,
        },
    ],
};


const addTrainingUnitTool: Tool = {
    name: "AddTrainingUnit",
    description: "Add a single training unit to a user's plan",
    parameters: [
        {
            name: "type",
            parameterName: "type",
            description: "The type of training unit",
            type: "string",
            required: true,
        },
        {
            name: "description",
            parameterName: "description",
            description: "Description of the training unit",
            type: "string",
            required: true,
        },
        {
            name: "instruction",
            parameterName: "instruction",
            description: "instruction of the training unit",
            type: "string",
            required: true,
        },
        {
            name: "duration",
            parameterName: "duration",
            description: "Duration of the training unit in minutes",
            type: "number",
            required: true,
        },
        {
            name: "intensity",
            parameterName: "intensity",
            description: "Intensity of the training unit (low, medium, high (all in lowercase))",
            type: "string",
            required: true,
        },
        {
            name: "date",
            parameterName: "date",
            description: "Date of the training unit (in YYYY-MM-DD format)",
            type: "string",
            required: true,
        },
    ],
};

async function GenerateTrainingPlan(userId: string, startDate?: string, endDate?: string) {
    const today = new Date();
    const defaultEndDate = new Date(today);
    defaultEndDate.setDate(defaultEndDate.getDate() + 28);

    if (!startDate || !isValidDate(startDate)) {
        startDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }
    if (!endDate || !isValidDate(endDate)) {
        endDate = defaultEndDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    const profile = await prisma.profile.findUnique({
        where: { userId: userId },
    });

    if (!profile) {
        throw new Error('User profile not found');
    }

    const events = await prisma.event.findMany({
        where: {
            userId: userId,
            date: {
                gte: new Date(`${startDate}T00:00:00Z`).toISOString(),
                lte: new Date(`${endDate}T00:00:00Z`).toISOString(),
            },
        },
    });

    let eventsDescription = '';
    if (events.length > 0) {
        eventsDescription = `The user has the following events during the specified time period:\n`;
        events.forEach(event => {
            eventsDescription += `- ${event.title} on ${new Date(event.date).toLocaleDateString()} (${event.description})\n`;
        });
    } else {
        eventsDescription = 'No events during the specified time period.';
    }

    const prompt = `You are an expert training plan generator. Create a personalized training plan for an athlete with the following profile:

    ### Athlete Profile
    - Fitness Level: ${profile.fitnessLevel}
    - Training History: ${profile.trainingHistory}
    - Weekly Training Effort: ${profile.weeklyEffort || 0} hours
    - Preferred Disciplines: ${profile.preferredDisciplines.join(', ')}
    - Training Schedule: ${JSON.stringify(profile.trainingSchedule, null, 2)}
    - Training Days: ${profile.weeklyTrainingDays.join(', ')}

    ### Time Period
    - Start Date: ${startDate}
    - End Date: ${endDate}
    ${eventsDescription}

    ### Requirements
    1. Training Volume
       - Total weekly training time must not exceed ${profile.weeklyEffort || 0} hours
       - Distribute training load evenly across the week
       - Include appropriate rest days

    2. Training Structure
       - Schedule training on the user's preferred days: ${profile.weeklyTrainingDays.join(', ')}
       - Follow the user's training schedule pattern: ${JSON.stringify(profile.trainingSchedule, null, 2)}
       - Use preferred disciplines: ${profile.preferredDisciplines.join(', ')}
       - Include a mix of intensities (low, medium, high)
       - Progress difficulty appropriately for fitness level: ${profile.fitnessLevel}

    3. Event Considerations
       - Account for any scheduled events
       - Adjust training load before and after events
       - Ensure proper tapering and recovery

    ### Output Format
    Return a JSON object with the following structure:
    {
      "trainings": [
        {
          "type": string (one of: ${profile.preferredDisciplines.join(', ')}),
          "description": string (brief overview of the session),
          "instruction": string (detailed session plan in the following format:
            Session Title (Duration)
            Goal: [specific training goal]
            Total Time: [total duration]
            Effort Zones:
            [Zone descriptions]

            ✅ Warm-Up
            [Detailed warm-up instructions]

            🔥 Main Set
            [Detailed main set instructions]

            💡 Focus Points
            [Key focus areas and technique tips]

            🧊 Cool Down
            [Detailed cool-down instructions]
          ),
          "duration": number (in minutes),
          "intensity": "low" | "medium" | "high",
          "date": string (YYYY-MM-DD format)
        }
      ]
    }

    ### Validation Rules
    - All dates must be within the specified range
    - Each day must have exactly one training unit
    - Training types must match preferred disciplines
    - Weekly hours must not exceed the specified limit
    - Training days must match the user's schedule
    - Each training unit must include detailed instructions in the specified format`;

    const client = new OpenAI({
        apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
    });


    const response = await client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o-mini',
        stream: false,
        response_format: {"type": "json_object"}
    });

    let trainingPlan;
    try {
        const content = response.choices[0].message?.content;

        if (content) {
            trainingPlan = JSON.parse(content);
        } else {
            throw new Error("Response content is null or undefined.");
        }
    } catch (error) {
        console.error('Error parsing Ollama response:', error);
        throw new Error('Invalid response from Ollama');
    }

    //const validationResult = z.array(TrainingUnitSchema).safeParse(trainingPlan);
    const validationResult = trainingPlan;

    /*if (!validationResult.success) {
        console.error('Validation error:', validationResult.error);
        throw new Error('Invalid training plan generated');
    }*/

    await prisma.trainingUnit.deleteMany({
        where: {
            userId: userId,
            /*date: {
                gte: new Date(`${startDate}T00:00:00Z`).toISOString(),
                lte: new Date(`${endDate}T00:00:00Z`).toISOString(),
            },*/
        },
    });

    const trainingUnitsWithUserId = validationResult.trainings.map((unit: TrainingUnit) => ({
        ...unit,
        userId: userId,
        date: new Date(`${unit.date}T00:00:00Z`).toISOString(),
    }));

    const savedUnits = await prisma.trainingUnit.createMany({
        data: trainingUnitsWithUserId,
    });

    return trainingUnitsWithUserId;
}

interface RescheduleChange {
    unitId: string;
    action: 'moved' | 'cancelled' | 'adjusted';
    explanation: string;
}

async function rescheduleTrainingPlan(userId: string, conflictingDateStart: string, conflictingDateEnd: string, reason: string) {
    const profile = await prisma.profile.findUnique({
        where: { userId: userId },
    });

    if (!profile) {
        throw new Error('User profile not found');
    }

    const currentPlan = await prisma.trainingUnit.findMany({
        where: { userId: userId },
        orderBy: { date: 'asc' },
    });

    let endDate = currentPlan[currentPlan.length-1].date;

    const prompt = `You are an expert training plan rescheduler. Reschedule the following training plan to accommodate a conflict while maintaining training goals.

    ### Current Situation
    - Conflict Period: ${new Date(conflictingDateStart).toISOString()} to ${new Date(conflictingDateEnd).toISOString()}
    - Reason: ${reason || 'Not specified'}
    - Plan End Date: ${endDate.toISOString()}
    - Current Plan: ${JSON.stringify(currentPlan)}

    ### Athlete Profile
    - Fitness Level: ${profile.fitnessLevel}
    - Training History: ${profile.trainingHistory}
    - Weekly Training Effort: ${profile.weeklyEffort || 0} hours
    - Preferred Disciplines: ${profile.preferredDisciplines.join(', ')}
    - Training Schedule: ${JSON.stringify(profile.trainingSchedule, null, 2)}
    - Training Days: ${profile.weeklyTrainingDays.join(', ')}

    ### Rescheduling Guidelines
    1. Conflict Resolution Options
       a) Move affected units to suitable alternative dates
       b) Cancel affected units if necessary
       c) Adjust unit parameters (intensity, duration) to fit new schedule

    2. Training Integrity
       - Maintain overall training progression
       - Preserve key training sessions
       - Keep appropriate rest periods
       - Respect the fixed end date: ${endDate.toISOString()}

    3. User Preferences
       - Schedule on preferred training days: ${profile.weeklyTrainingDays.join(', ')}
       - Use preferred disciplines: ${profile.preferredDisciplines.join(', ')}
       - Follow training schedule pattern: ${JSON.stringify(profile.trainingSchedule, null, 2)}
       - Maintain weekly training effort: ${profile.weeklyEffort || 0} hours

    4. Adjustments
       - Modify intensity or volume to compensate for changes
       - Ensure proper recovery periods
       - Consider fitness level: ${profile.fitnessLevel}
       - Account for training history: ${profile.trainingHistory}

    ### Output Format
    Return a JSON object with the following structure:
    {
      "rescheduledPlan": [
        {
          "id": string,
          "type": string,
          "description": string (brief overview of the session),
          "instruction": string (detailed session plan in the following format:
            🏃 Session Title (Duration)
            Goal: [specific training goal]
            Total Time: [total duration]
            Effort Zones:
            [Zone descriptions]

            ✅ Warm-Up
            [Detailed warm-up instructions]

            🔥 Main Set
            [Detailed main set instructions]

            💡 Focus Points
            [Key focus areas and technique tips]

            🧊 Cool Down
            [Detailed cool-down instructions]
          ),
          "duration": number,
          "intensity": string,
          "date": string
        }
      ],
      "changes": [
        {
          "unitId": string,
          "action": "moved" | "cancelled" | "adjusted",
          "explanation": string (detailed explanation of the change)
        }
      ]
    }

    ### Validation Rules
    - No training units beyond the end date
    - Weekly training effort maintained
    - Training days match user preferences
    - All changes must be justified
    - Training progression preserved
    - Each training unit must include detailed instructions in the specified format`;

    const client = new OpenAI({
        apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
    });


    const response = await client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o-mini',
        stream: false,
        response_format: {"type": "json_object"},
    });

    let responseObject;
    try {
        const content = response.choices[0].message?.content;

        if (content) {
            responseObject = JSON.parse(content);
            const { rescheduledPlan, changes }: { rescheduledPlan: TrainingUnit[], changes: RescheduleChange[] } = responseObject;
            if (new Date(Math.max(...rescheduledPlan.map((unit: TrainingUnit) => new Date(unit.date).getTime()))) > endDate) {
                throw new Error('AI rescheduled plan exceeds the specified end date');
            }

            const cancelledUnitIds = changes
                .filter((change: RescheduleChange) => change.action === 'cancelled')
                .map((change: RescheduleChange) => change.unitId);

            const transactionOperations = [
                ...(cancelledUnitIds.length > 0 ? [
                    prisma.trainingUnit.deleteMany({
                        where: {
                            userId: userId,
                            id: {
                                in: cancelledUnitIds
                            }
                        }
                    })
                ] : []),
                ...rescheduledPlan.map((unit: TrainingUnit) =>
                    prisma.trainingUnit.upsert({
                        where: { id: unit.id },
                        update: {
                            ...unit,
                            userId: userId
                        },
                        create: {
                            ...unit,
                            userId: userId
                        },
                    })
                )
            ];

            await prisma.$transaction(transactionOperations);

            return { rescheduledPlan, changes };
        } else {
            throw new Error("Response content is null or undefined.");
        }
    } catch (error) {
        console.error('Error parsing Ollama response:', error);
        throw new Error('Invalid response from Ollama');
    }
}

async function AddTrainingUnit(userId: string, type: string, description: string, instruction:string, duration: number, intensity: string, date: string) {
    const validationResult = TrainingUnitSchema.safeParse({
        type,
        description,
        instruction,
        duration,
        intensity,
        date
    });

    if (!validationResult.success) {
        console.error('Validation error:', validationResult.error);
        throw new Error('Invalid training unit data');
    }

    const dateObject = new Date(`${validationResult.data.date}T00:00:00Z`);
    const isoDateString = dateObject.toISOString();

    const savedUnit = await prisma.trainingUnit.create({
        data: {
            userId,
            type: validationResult.data.type,
            description: validationResult.data.description,
            instruction: validationResult.data.instruction,
            duration: validationResult.data.duration,
            intensity: validationResult.data.intensity,
            date: isoDateString,
        },
    });

    return savedUnit;
}

const getTrainingUnitForDayTool: Tool = {
    name: "GetTrainingUnitForDay",
    description: "Retrieve training units for a specific day. This tool should be used when the user asks to view or check their scheduled training unit (e.g., 'what's my training today?').",
    parameters: [
        {
            name: "date",
            parameterName: "date",
            description: "The date to get training units for (in YYYY-MM-DD format, e.g., 'today')",
            type: "string",
            required: true,
        },
    ],
};

const getTrainingUnitsForRangeTool: Tool = {
    name: "GetTrainingUnitsForRange",
    description: "Get training units for a range of dates",
    parameters: [
        {
            name: "startDate",
            parameterName: "startDate",
            description: "The start date of the range (YYYY-MM-DD format)",
            type: "string",
            required: true,
        },
        {
            name: "endDate",
            parameterName: "endDate",
            description: "The end date of the range (YYYY-MM-DD format)",
            type: "string",
            required: true,
        },
    ],
};

const EditTrainingUnitByDateTool: Tool = {
    name: "EditTrainingUnitByDate",
    description: "Edit an existing training unit on a specific date and change its parameters (such as intensity or duration). This tool should be used when the user asks to modify a specific unit (e.g., 'make today's unit harder').",
    parameters: [
        {
            name: "userId",
            parameterName: "userId",
            description: "The ID of the user",
            type: "string",
            required: true,
        },
        {
            name: "date",
            parameterName: "date",
            description: "The date of the unit to edit (in YYYY-MM-DD format, e.g., 'today')",
            type: "string",
            required: true,
        },
        {
            name: "updates",
            parameterName: "updates",
            description: "A JSON string containing the updates to apply to the training unit (e.g., change intensity to 'high')",
            type: "string",
            required: true,
        },
    ],
};

export const toolsString = JSON.stringify(
    {
        tools: [generateTrainingPlanTool, addTrainingUnitTool, getTrainingUnitForDayTool, getTrainingUnitsForRangeTool, rescheduleTrainingPlanTool, EditTrainingUnitByDateTool],
    },
    null,
    2,
);

function getValueOfParameter(
    parameterName: string,
    parameters: FunctionParameter[],
) {
    return parameters.filter((p) => p.parameterName === parameterName)[0]
        .parameterValue;
}

export async function executeFunction(
    functionName: string,
    parameters: FunctionParameter[],
) {

    switch (functionName) {
        case "GenerateTrainingPlan":
            console.log("GenerateTrainingPlan")
            return await GenerateTrainingPlan(
                getValueOfParameter("userId", parameters),
                getValueOfParameter("startDate", parameters),
                getValueOfParameter("endDate", parameters)
            );
        case "rescheduleTrainingPlan":
            console.log("rescheduleTrainingPlan")
            return await rescheduleTrainingPlan(
                getValueOfParameter("userId", parameters),
                getValueOfParameter("conflictingDateStart", parameters),
                getValueOfParameter("conflictingDateEnd", parameters),
                getValueOfParameter("reason", parameters)
            );
        case "AddTrainingUnit":
            console.log("AddTrainingUnit")
            return await AddTrainingUnit(
                getValueOfParameter("userId", parameters),
                getValueOfParameter("type", parameters),
                getValueOfParameter("description", parameters),
                getValueOfParameter("instruction", parameters),
                parseInt(getValueOfParameter("duration", parameters)),
                getValueOfParameter("intensity", parameters),
                getValueOfParameter("date", parameters)
            );
        case "GetTrainingUnitForDay":
            console.log("GetTrainingUnitForDay")
            return await GetTrainingUnitForDay(
                getValueOfParameter("userId", parameters),
                getValueOfParameter("date", parameters)
            );
        case "GetTrainingUnitsForRange":
            console.log("GetTrainingUnitsForRange")
            return await GetTrainingUnitsForRange(
                getValueOfParameter("userId", parameters),
                getValueOfParameter("startDate", parameters),
                getValueOfParameter("endDate", parameters)
            );
        case "EditTrainingUnitByDate":
            console.log("EditTrainingUnit")
            return await EditTrainingUnitByDate(
                getValueOfParameter("userId", parameters),
                getValueOfParameter("date", parameters),
                JSON.parse(getValueOfParameter("updates", parameters))
            );
    }
}

export const promptAndAnswer = async (prompt: string, userId: string) => {

    const systemPrompt = `
You are a helpful assistant that manages a user's training schedule. You can generate training plans, add individual training units, retrieve existing training units, and edit training units.

### Tool Selection Instructions:
- **Edit Training Unit**: If the user asks to change, modify, or update a training unit (e.g., "make the unit harder", "change the intensity", "edit today's session"), use the "EditTrainingUnitByDate" tool. You should first retrieve the unit for the specified date and apply the requested changes. The changes should match the user's request (e.g., intensity, duration, type).
- **Retrieve Training Unit**: If the user asks to view or check their training unit for a specific day (e.g., "what's my training today?", "show me tomorrow's training session"), use the "GetTrainingUnitForDay" tool.
- **Generate Training Plan**: If the user asks to create a new training plan (e.g., "create a training plan for me"), use the "GenerateTrainingPlan" tool.
- **Add Training Unit**: If the user asks to add a specific unit (e.g., "add a new run session"), use the "AddTrainingUnit" tool.

### Date Handling:
- Translate natural language dates into actual dates using the YYYY-MM-DD format.
- For example:
  - "today" is ${getCurrentDateInYYYYMMDD()}.
  - "tomorrow" is ${getTomorrowDateInYYYYMMDD()}.
  - Translate expressions like "next Monday", "this Friday" into the appropriate date.
  
### Example Responses:
If the user says, "make my training today harder," respond with:
{
  "functionName": "EditTrainingUnitByDate",
  "parameters": [
    { "parameterName": "userId", "parameterValue": "12345" },
    { "parameterName": "date", "parameterValue": "${getCurrentDateInYYYYMMDD()}" },
    { "parameterName": "updates", "parameterValue": "{ 'intensity': 'high' }" }
  ]
}

If the user says, "what's my training tomorrow?", respond with:
{
  "functionName": "GetTrainingUnitForDay",
  "parameters": [
    { "parameterName": "date", "parameterValue": "${getTomorrowDateInYYYYMMDD()}" }
  ]
}

Always respond as JSON using the following schema:
{
  "functionName": "function name",
  "parameters": [
    { "parameterName": "name of parameter", "parameterValue": "value of parameter" }
  ]
}

The tools are: ${toolsString}
`;


    const client = new OpenAI({
        apiKey: process.env['OPENAI_API_KEY'],
    });

    let responseObject;
    console.log(`parse response for user ${userId}`);

    try {

        const response = await client.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }, {role: 'user', content:prompt}],
            model: 'gpt-4o-mini',
            stream: false,
            response_format: {"type": "json_object"},
        });

        // const response = await Ollama.generate({
        //     model: "llama3:latest",
        //     system: systemPrompt,
        //     prompt: prompt,
        //     stream: false,
        //     format: "json",
        // });

        const content = response.choices[0].message?.content;
        console.log(content);
        if (content) {
            responseObject = JSON.parse(content);
            console.log(`Successfully parsed response for user ${userId}`);

        } else {
            throw new Error("Response content is null or undefined.");
        }
    } catch (error) {
        console.error('Error parsing Ollama response:', error);
        throw new Error('Invalid response from Ollama');
    }

    if (!responseObject.parameters.some((p:{
        parameterName: string;
        parameterValue: string;
    }) => p.parameterName === "userId")) {
        responseObject.parameters.push({ parameterName: "userId", parameterValue: userId });
    }

    handleDateParameters(responseObject);

    try {
        return await executeFunction(responseObject.functionName, responseObject.parameters);
    } catch (error) {
        console.error('Error executing function:', error);
        throw error;
    }
};

function handleDateParameters(responseObject: any) {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

    if (responseObject.functionName === "GetTrainingUnitForDay") {
        const dateParam = responseObject.parameters.find((p: any) => p.parameterName === "date");
        if (dateParam) {
            if (dateParam.parameterValue.toLowerCase() === "today") {
                dateParam.parameterValue = today;
            } else if (dateParam.parameterValue.toLowerCase() === "tomorrow") {
                dateParam.parameterValue = tomorrow;
            }
        }
    } else if (responseObject.functionName === "EditTrainingUnitByDate") {
        const updatesParam = responseObject.parameters.find((p: any) => p.parameterName === "updates");
        if (updatesParam) {
            const updates = JSON.parse(updatesParam.parameterValue);
            if (updates.date) {
                if (updates.date.toLowerCase() === "today") {
                    updates.date = today;
                } else if (updates.date.toLowerCase() === "tomorrow") {
                    updates.date = tomorrow;
                }
            }
            updatesParam.parameterValue = JSON.stringify(updates);
        }
    }
}

export const askLlm = async (prompt: string ) => {
    const systemPrompt = `Analyze the following cycling performance data and provide a detailed evaluation. Please focus solely on the performance metrics, excluding any congratulatory remarks or general motivational statements.`;

    const client = new OpenAI({
        apiKey: process.env['OPENAI_API_KEY'],
    });

    const response = await client.chat.completions.create({
        messages: [{ role: 'system', content: systemPrompt }, {role: 'user', content:prompt}],
        model: 'gpt-4o-mini',
    });

    try {
        const responseObject = response.choices[0].message?.content;
        return responseObject;
    } catch (error) {
        console.error('Error parsing Ollama response:', error);
        throw new Error('Invalid response from Ollama');
    }
};

// New function to handle multi-day modifications
async function ModifyTrainingPlan(userId: string, startDate: string, endDate: string, reason: string, modifications: {
    type?: 'rest' | 'reduced' | 'cross-training';
    sportReplacement?: string;
    intensity?: 'low' | 'medium' | 'high';
}) {
    const profile = await prisma.profile.findUnique({
        where: { userId: userId },
    });

    if (!profile) {
        throw new Error('User profile not found');
    }

    const units = await prisma.trainingUnit.findMany({
        where: {
            userId: userId,
            date: {
                gte: new Date(`${startDate}T00:00:00Z`).toISOString(),
                lte: new Date(`${endDate}T23:59:59Z`).toISOString(),
            },
        },
        orderBy: { date: 'asc' },
    });

    const modifiedUnits = units.map(unit => {
        let modifiedUnit = { ...unit };

        // Handle different modification scenarios
        switch (modifications.type) {
            case 'rest':
                // Convert to rest days
                modifiedUnit = {
                    ...unit,
                    type: 'rest',
                    description: 'Rest Day',
                    instruction: '🛌 Rest Day\n\nTake a complete rest day to allow your body to recover. Focus on:\n- Hydration\n- Nutrition\n- Light stretching if needed\n- Good sleep',
                    duration: 0,
                    intensity: 'low'
                };
                break;

            case 'reduced':
                // Reduce intensity and duration
                modifiedUnit.duration = Math.floor(unit.duration * 0.7);
                modifiedUnit.intensity = 'low';
                modifiedUnit.instruction = `⚠️ Recovery Session\n\n${unit.instruction}\n\nNote: This session has been modified for recovery. Focus on maintaining good form and listen to your body.`;
                break;

            case 'cross-training':
                // Replace with alternative sport
                if (modifications.sportReplacement) {
                    if (!profile.preferredDisciplines.includes(modifications.sportReplacement)) {
                        throw new Error('Replacement sport must be one of your preferred disciplines');
                    }
                    modifiedUnit.type = modifications.sportReplacement;
                    modifiedUnit.instruction = `🔄 Cross-Training Session\n\n${unit.instruction}\n\nNote: This session has been adapted for ${modifications.sportReplacement}. Maintain similar effort levels and focus on proper technique.`;
                }
                break;
        }

        // Apply intensity modification if specified
        if (modifications.intensity) {
            modifiedUnit.intensity = modifications.intensity;
            // Adjust duration based on intensity change
            if (modifications.intensity === 'low') {
                modifiedUnit.duration = Math.floor(unit.duration * 0.7);
            } else if (modifications.intensity === 'high') {
                modifiedUnit.duration = Math.floor(unit.duration * 1.2);
            }
        }

        return modifiedUnit;
    });

    // Update all modified units in a transaction
    await prisma.$transaction(
        modifiedUnits.map(unit =>
            prisma.trainingUnit.update({
                where: { id: unit.id },
                data: unit,
            })
        )
    );

    return modifiedUnits;
}
