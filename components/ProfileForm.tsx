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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

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
}

const ProfileForm: React.FC = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();
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
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
            fetchProfile();
        }
    }, [session]);

    const fetchProfile = async () => {
        const response = await fetch('/api/profile');
        if (response.ok) {
            const data = await response.json();
            if (data) {
                const formattedData = {
                    ...data,
                    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
                };
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formattedProfile = {
            ...profile,
            dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString() : null,
        };

        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formattedProfile),
        });

        if (response.ok) {
            toast({
                title: "Profile Updated",
                description: "Your profile has been successfully updated.",
            });
            fetchProfile();
        } else {
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
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
        <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="flex justify-end">
                <Button type="submit" size="lg">
                    Save Profile
                </Button>
            </div>
        </form>
    );
};

export default ProfileForm;
