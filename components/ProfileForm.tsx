'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import { TrainingScheduleInput, type DaySchedule } from './TrainingScheduleInput';

interface ProfileData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    height: string;
    weight: string;
    fitnessLevel: string;
    trainingHistory: string;
    availableTrainingTime: string;
    trainingSchedule: {
        [key: string]: DaySchedule;
    };
    preferredDisciplines: string[];
    weeklyTrainingHours: number;
}

const DISCIPLINES = ['RUNNING', 'CYCLING', 'SWIMMING', 'TRIATHLON'];

const ProfileForm: React.FC = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<ProfileData>({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        height: '',
        weight: '',
        fitnessLevel: '',
        trainingHistory: '',
        availableTrainingTime: '',
        trainingSchedule: {},
        preferredDisciplines: [],
        weeklyTrainingHours: 0,
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    useEffect(() => {
        if (!session?.user?.id) {
            toast({
                title: "Error",
                description: "No valid session. Please try signing out and signing in again.",
                variant: "destructive",
            });
            return;
        }
        
        fetchProfile();
    }, [session]);

    const fetchProfile = async () => {
        const response = await fetch('/api/profile');
        if (response.ok) {
            const data = await response.json();
            if (data) {
                const formattedData = {
                    ...data,
                    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
                    trainingSchedule: data.trainingSchedule || {},
                    weeklyTrainingHours: data.weeklyTrainingHours || 0,
                    availableTrainingTime: data.weeklyEffort?.toString() || '',
                };

                // Calculate total weekly hours from training schedule if it exists
                if (data.trainingSchedule) {
                    const totalHours = Object.values(data.trainingSchedule as { [key: string]: DaySchedule }).reduce((total, daySchedule) => {
                        return total + (daySchedule?.effort || 0);
                    }, 0);
                    formattedData.weeklyTrainingHours = totalHours;
                }

                setProfile(formattedData);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string, name: string) => {
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleDisciplinesChange = (discipline: string) => {
        setProfile((prev) => {
            const disciplines = prev.preferredDisciplines.includes(discipline)
                ? prev.preferredDisciplines.filter(d => d !== discipline)
                : [...prev.preferredDisciplines, discipline];
            return { ...prev, preferredDisciplines: disciplines };
        });
    };

    const handleScheduleChange = (schedule: { [key: string]: DaySchedule }) => {
        setProfile(prev => ({ ...prev, trainingSchedule: schedule }));
        
        // Calculate total weekly hours
        const totalHours = Object.values(schedule).reduce((total, daySchedule) => {
            return total + (daySchedule?.effort || 0);
        }, 0);
        
        setProfile(prev => ({ ...prev, weeklyTrainingHours: totalHours }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        if (!session?.user?.id) {
            toast({
                title: "Error",
                description: "No valid session. Please try signing out and signing in again.",
                variant: "destructive",
            });
            setIsSaving(false);
            return;
        }
        
        const formattedProfile = {
            ...profile,
            dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString() : null,
            trainingSchedule: profile.trainingSchedule,
            preferredDisciplines: profile.preferredDisciplines,
            weeklyTrainingHours: profile.weeklyTrainingHours,
        };

        try {
            // Show saving toast immediately
            toast({
                title: "Saving...",
                description: "Updating your profile...",
            });

            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedProfile),
            });

            const data = await response.json();

            if (response.ok) {
                // Clear any existing toasts
                toast({
                    title: "Success! 🎉",
                    description: "Your profile has been saved successfully.",
                });
                await fetchProfile();
            } else {
                console.error('Profile update failed:', data);
                toast({
                    title: "Error",
                    description: data.error || "Failed to update profile. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Profile update error:', error);
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return null;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={profile.dateOfBirth}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={profile.gender} onValueChange={(value) => handleSelectChange(value, 'gender')}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                        type="number"
                        id="height"
                        name="height"
                        value={profile.height}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                        type="number"
                        id="weight"
                        name="weight"
                        value={profile.weight}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fitnessLevel">Fitness Level</Label>
                    <Select value={profile.fitnessLevel} onValueChange={(value) => handleSelectChange(value, 'fitnessLevel')}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select fitness level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="elite">Elite</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="availableTrainingTime">Available Training Time (hours/week)</Label>
                    <Input
                        type="number"
                        id="availableTrainingTime"
                        name="availableTrainingTime"
                        value={profile.availableTrainingTime}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="trainingHistory">Training History</Label>
                <Textarea
                    id="trainingHistory"
                    name="trainingHistory"
                    value={profile.trainingHistory}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about your training experience..."
                />
            </div>

            <div className="space-y-4">
                <Label>Preferred Disciplines</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {DISCIPLINES.map((discipline) => (
                        <Button
                            key={discipline}
                            type="button"
                            variant={profile.preferredDisciplines.includes(discipline) ? "default" : "outline"}
                            onClick={() => handleDisciplinesChange(discipline)}
                            className="w-full"
                        >
                            {discipline.charAt(0) + discipline.slice(1).toLowerCase()}
                        </Button>
                    ))}
                </div>
            </div>

            <TrainingScheduleInput
                value={profile.trainingSchedule}
                onChange={handleScheduleChange}
            />

            <Button 
                type="submit" 
                className="w-full md:w-auto"
                disabled={isSaving}
            >
                {isSaving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    'Save Profile'
                )}
            </Button>
        </form>
    );
};

export default ProfileForm;
