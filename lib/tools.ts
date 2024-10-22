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

    const existingUnit = await prisma.trainingUnit.findFirst({
        where: {
            date: date,
            userId: userId,
        },
    });

    if (!existingUnit) {
        throw new Error('Training unit not found or does not belong to the user.');
    }

    const updatedUnit = await prisma.trainingUnit.update({
        where: {
            id: existingUnit.id,
        },
        data: {
            ...updates,
            date: updates.date ? new Date(updates.date) : undefined,
        },
    });

    console.log(updatedUnit)

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

async function GenerateTrainingPlan(userId: string, startDate?: string,  endDate?: string, ) {

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

    const prompt = `Generate a training plan (from ${startDate} to ${endDate}) for an athlete with the following profile:
    Fitness Level: ${profile.fitnessLevel}
    Available Training Time: ${profile.availableTrainingTime} hours per week
    Training History: ${profile.trainingHistory}

    ${eventsDescription}

    Please provide the training plan as a JSON array of training units. It should have the following structure:
    {"trainings": [{
      "type": string,
      "description": string,
      "instruction": string,
      "duration": number (in minutes),
      "intensity": "low" | "medium" | "high",
      "date": string (in YYYY-MM-DD format, e.g., "2023-03-17")
    },
    {
      "type": string,
      "description": string,
      "instruction": string,
      "duration": number (in minutes),
      "intensity": "low" | "medium" | "high",
      "date": string (in YYYY-MM-DD format, e.g., "2023-03-17")
    }]}

    Ensure that:
    1. The total duration of training units doesn't exceed the available training time per week.
    2. The plan is appropriate for the user's fitness level and training history.
    3. There's a good mix of different types of exercises and intensities.
    4. Rest days are included as appropriate.
    5. All dates fall within the specified date range.
    6. all days in the date range must be set.
    7. The plan progresses in difficulty over time if appropriate for the user's level.`;

    const client = new OpenAI({
        apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
    });


    const response = await client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o-mini',
        stream: false,
        response_format: {"type": "json_object"},
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

    return savedUnits;
}

async function rescheduleTrainingPlan(userId: string, conflictingDateStart: string, conflictingDateEnd: string, reason:string) {

    const currentPlan = await prisma.trainingUnit.findMany({
        where: { userId: userId },
        orderBy: { date: 'asc' },
    });

    let endDate = currentPlan[currentPlan.length-1].date

    const prompt = `
    I need to reschedule my training plan. Here's the situation:
    - Current plan: ${JSON.stringify(currentPlan)}
    - Conflicting dates: from ${ new Date(conflictingDateStart).toISOString()} to ${ new Date(conflictingDateEnd).toISOString()}
    - Fixed end date of the plan: ${endDate.toISOString()}
    - Reason for rescheduling: ${reason || 'Not specified'}

    Please provide a rescheduled plan that:
    1. Resolves conflicts for the specified dates by deciding whether to:
       a) Move affected units to suitable alternative dates
       b) Cancel affected units
       c) Adjust the plan to accommodate the changes (e.g., by modifying intensities or combining units)
    2. Maintains a balanced progression towards the training goals
    3. Ensures appropriate placement of rest days
    4. Adheres to the fixed end date of ${endDate.toISOString()}
    5. Adjusts the intensity or volume of remaining units if necessary to compensate for any cancellations or moves

    Consider the following in your decision-making:
    - The overall training load and progression
    - The importance of each unit in the broader context of the plan
    - The proximity to the end date (which might be a competition or event)
    - The reason for rescheduling, if provided

    For each change you make, please provide a brief explanation of your reasoning.
    
    Today is the ${getCurrentDateInYYYYMMDD()}

    Return the new plan as a JSON object with the following structure:
    {
      "rescheduledPlan": [/* array of TrainingUnit objects */],
      "changes": [
        {
          "unitId": "id of the affected unit",
          "action": "moved" | "cancelled" | "adjusted",
          "explanation": "Brief explanation of the decision"
        }
      ]
    }
  `;

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
            const { rescheduledPlan, changes }: { rescheduledPlan: TrainingUnit[], changes: any[] } = JSON.parse(responseObject);
            if (new Date(Math.max(...rescheduledPlan.map(unit => new Date(unit.date).getTime()))) > endDate) {
                throw new Error('AI rescheduled plan exceeds the specified end date');
            }

            await prisma.$transaction([
                prisma.trainingUnit.deleteMany({
                    where: {
                        id: {
                            in: changes
                                .filter(change => change.action === 'cancelled')
                                .map(change => change.unitId)
                        }
                    }
                }),
                ...rescheduledPlan.map(unit =>
                    prisma.trainingUnit.upsert({
                        where: { id: unit.id },
                        update: unit,
                        create: unit,
                    })
                )
            ]);

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
    console.log(functionName)
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

    console.log(systemPrompt)

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

    let responseObject;
    try {
        const content = response.choices[0].message?.content;

        if (content) {
            responseObject = JSON.parse(content);
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
