'use client'

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
    Calendar, 
    Clock, 
    Activity, 
    CheckCircle2, 
    XCircle,
    Dumbbell,
    Footprints,
    Bike,
} from 'lucide-react';
import { useTranslation } from '@/provider/LanguageProvider';

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

interface TrainingUnitDetailProps {
    unit: TrainingUnit | null;
    isOpen: boolean;
    onClose: () => void;
    onComplete: (id: string, completed: boolean) => void;
}

const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'run':
            return <Footprints className="h-5 w-5" />;
        case 'bike':
            return <Bike className="h-5 w-5" />;
        default:
            return <Dumbbell className="h-5 w-5" />;
    }
};

const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
        case 'low':
            return 'bg-green-100 text-green-800';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800';
        case 'high':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const TrainingUnitDetail: React.FC<TrainingUnitDetailProps> = ({
    unit,
    isOpen,
    onClose,
    onComplete,
}) => {
    const { t } = useTranslation();

    if (!unit) return null;

    const formattedDate = new Date(unit.date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        {getTypeIcon(unit.type)}
                        <span>{unit.type}</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 px-6">
                    {/* Status Badge */}
                    <div className="flex justify-end mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            unit.completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {unit.completed ? 'Completed' : 'Pending'}
                        </span>
                    </div>

                    <div className="space-y-6">
                        {/* Date */}
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{formattedDate}</span>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{unit.duration} minutes</span>
                        </div>

                        {/* Intensity */}
                        <div className="flex items-center gap-2 text-sm">
                            <Activity className="h-4 w-4 text-gray-500" />
                            <span className={`px-2 py-1 rounded ${getIntensityColor(unit.intensity)}`}>
                                {unit.intensity} {t('trainingUnits.detail.intensity')}
                            </span>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-base">{t('trainingUnits.detail.description')}</h4>
                            <p className="text-sm">{unit.description}</p>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-2">
                            <h4 className="font-medium text-base">{t('trainingUnits.detail.instructions')}</h4>
                            <p className="text-sm whitespace-pre-wrap">{unit.instruction}</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 p-6 border-t mt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                    <Button
                        variant={unit.completed ? "destructive" : "default"}
                        onClick={() => onComplete(unit.id, !unit.completed)}
                        className="gap-2"
                    >
                        {unit.completed ? (
                            <>
                                <XCircle className="h-4 w-4" />
                                Mark as Incomplete
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                Mark as Complete
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TrainingUnitDetail; 