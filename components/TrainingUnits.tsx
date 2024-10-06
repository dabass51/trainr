import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface TrainingUnit {
    id: string;
    type: string;
    description: string;
    instruction: string;
    duration: number;
    intensity: string;
    date: string;
    completed: boolean;
}

interface TrainingUnitsProps {
    prompt: string;
    onGeneratePlan: (prompt: string) => void;
}

const TrainingUnits: React.FC<TrainingUnitsProps> = ({ prompt, onGeneratePlan }) => {
    const { data: session } = useSession();
    const [units, setUnits] = useState<TrainingUnit[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (session) {
            fetchTrainingUnits();
        }
    }, [session]);

    const fetchTrainingUnits = async () => {
        const response = await fetch('/api/training-units');
        if (response.ok) {
            const data = await response.json();
            setUnits(data);
        } else {
            setError('Failed to fetch training units');
        }
    };

    const handleComplete = async (id: string) => {
        const response = await fetch('/api/training-units', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, completed: true }),
        });

        if (response.ok) {
            fetchTrainingUnits();
        }
    };

    const handleDelete = async (id: string) => {
        const response = await fetch(`/api/training-units?id=${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            fetchTrainingUnits();
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Training Units</h2>
            {error && <div className="text-red-500">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {units && units.map((unit) => (
                    <div key={unit.id}
                         className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200">
                        <h3 className="font-bold text-lg mb-2">{unit.type}</h3>
                        <p className="text-sm mb-1">{unit.description}</p>
                        <p className="text-sm mb-1">Duration: {unit.duration} minutes</p>
                        <p className="text-sm mb-1">Instruction: {unit.instruction}</p>
                        <p className="text-sm mb-1">Intensity: {unit.intensity}</p>
                        <p className="text-sm mb-1">Date: {new Date(unit.date).toLocaleDateString()}</p>
                        <p className="text-sm mb-3">Status: {unit.completed ? 'Completed' : 'Pending'}</p>
                        <div className="flex justify-between">
                            {!unit.completed && (
                                <button
                                    onClick={() => handleComplete(unit.id)}
                                    className="py-1 px-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors duration-200"
                                >
                                    Complete
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(unit.id)}
                                className="py-1 px-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors duration-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrainingUnits;
