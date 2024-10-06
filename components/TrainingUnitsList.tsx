import React from 'react';

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

interface TrainingUnitsListProps {
    units: TrainingUnit[];
    onComplete: (id: string) => void;
    onDelete: (id: string) => void;
}

const TrainingUnitsList: React.FC<TrainingUnitsListProps> = ({ units, onComplete, onDelete }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {units.map((unit) => (
                <div
                    key={unit.id}
                    className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
                >
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
                                onClick={() => onComplete(unit.id)}
                                className="py-1 px-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors duration-200"
                            >
                                Complete
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(unit.id)}
                            className="py-1 px-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors duration-200"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TrainingUnitsList;
