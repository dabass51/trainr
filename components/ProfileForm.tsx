'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
    const { data: session } = useSession();
    const router = useRouter();
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
        if (session) {
            fetchProfile();
        }
    }, [session]);

    const fetchProfile = async () => {
        const response = await fetch('/api/profile');
        if (response.ok) {
            const data = await response.json();
            if( data ) {
                setProfile(data);
            }

        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile),
        });

        if (response.ok) {
            router.push('/dashboard');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                </label>
                <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                </label>
                <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                    Date of Birth
                </label>
                <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    value={profile.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender
                </label>
                <select
                    name="gender"
                    id="gender"
                    value={profile.gender}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                    Height (cm)
                </label>
                <input
                    type="number"
                    name="height"
                    id="height"
                    value={profile.height}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                    Weight (kg)
                </label>
                <input
                    type="number"
                    name="weight"
                    id="weight"
                    value={profile.weight}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            <div>
                <label htmlFor="fitnessLevel" className="block text-sm font-medium text-gray-700">
                    Fitness Level
                </label>
                <select
                    name="fitnessLevel"
                    id="fitnessLevel"
                    value={profile.fitnessLevel}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                    <option value="">Select fitness level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="elite">Elite</option>
                </select>
            </div>
            <div>
                <label htmlFor="trainingHistory" className="block text-sm font-medium text-gray-700">
                    Training History
                </label>
                <textarea
                    name="trainingHistory"
                    id="trainingHistory"
                    value={profile.trainingHistory}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                ></textarea>
            </div>
            <div>
                <label htmlFor="availableTrainingTime" className="block text-sm font-medium text-gray-700">
                    Available Training Time (hours per week)
                </label>
                <input
                    type="number"
                    name="availableTrainingTime"
                    id="availableTrainingTime"
                    value={profile.availableTrainingTime}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            <div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Save Profile
                </button>
            </div>
        </form>
    );
};

export default ProfileForm;
