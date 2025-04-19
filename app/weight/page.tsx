'use client'

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { WeightEntry } from '@prisma/client';
import { Card, CardTitle, CardDescription, CardHeader,CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import BMIWidget from '@/components/BMIWidget';
type WeightUnit = "kg" | "lbs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
export default function WeightPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [weight, setWeight] = useState<string>('');
    const [weights, setWeights] = useState<WeightEntry[]>([]);
    const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
    const [userHeight, setUserHeight] = useState<number | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchWeights = async (): Promise<void> => {
            const res = await fetch('/api/weight');
            if (res.ok) {
                const data: WeightEntry[] = await res.json();
                setWeights(data);
            }
        };
        fetchWeights();
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            const res = await fetch('/api/profile');
            if (res.ok) {
                const profile = await res.json();
                setUserHeight(profile.height ?? null);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        const today = format(new Date(), 'yyyy-MM-dd');
        const res = await fetch('/api/weight', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ weight: parseFloat(weight), unit, date: today }),
        });

        if (res.ok) {
            const newWeight = await res.json();
            // Fetch all weights again to ensure we have the latest data
            const weightsRes = await fetch('/api/weight');
            if (weightsRes.ok) {
                const updatedWeights = await weightsRes.json();
                setWeights(updatedWeights);
            }
            setWeight('');
            setRefreshKey((k) => k + 1);
        }
    };

    const handleUnitChange = (newUnit: 'kg' | 'lbs'): void => {
        if (unit !== newUnit) {
            const convertedWeight = newUnit === 'kg'
                ? (parseFloat(weight) / 2.205).toFixed(2)
                : (parseFloat(weight) * 2.205).toFixed(2);
            setWeight(convertedWeight);
            setUnit(newUnit);
        }
    };

    // Compute BMI zone weight thresholds for the user's height
    let bmiZones: { label: string; y1: number; y2: number; color: string; labelColor: string }[] = [];
    let maxZoneWeight = 0;
    if (userHeight) {
        const h = userHeight / 100;
        const w18_5 = 18.5 * h * h;
        const w25 = 25 * h * h;
        const w30 = 30 * h * h;
        maxZoneWeight = w30 + 20; // add margin for obese zone
        bmiZones = [
            { label: 'Underweight', y1: 0, y2: w18_5, color: '#b3e0ff', labelColor: '#0077b6' },
            { label: 'Normal', y1: w18_5, y2: w25, color: '#d4f8e8', labelColor: '#009e60' },
            { label: 'Overweight', y1: w25, y2: w30, color: '#fff3cd', labelColor: '#b8860b' },
            { label: 'Obese', y1: w30, y2: maxZoneWeight, color: '#ffd6d6', labelColor: '#d90429' },
        ];
    }

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (status === 'unauthenticated') {
        router.push('/auth/signin');
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Enter Today&apos;s Weight</CardTitle>
                        <CardDescription>Keep track of your weight journey</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        id="weight"
                                        type="number"
                                        step="0.1"
                                        placeholder={`Enter your weight in ${unit}`}
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        className="flex-grow"
                                        required
                                    />
                                    <Select value={unit} onValueChange={(value: WeightUnit) => handleUnitChange(value)}>
                                        <SelectTrigger className="w-[80px]">
                                            <SelectValue placeholder="Unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="kg">kg</SelectItem>
                                            <SelectItem value="lbs">lbs</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button type="submit">Save Weight</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Weight History</CardTitle>
                        <CardDescription>Your weight trend over time</CardDescription>
                    </CardHeader>
                    <CardContent className="w-full p-0">
                        <ChartContainer
                            config={{
                                weight: {
                                    label: `Weight (${unit})`,
                                    color: "hsl(var(--chart-1))",
                                },
                            }}
                            className="h-[300px] w-full"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weights}>
                                    {/* BMI ZONES as background */}
                                    {bmiZones.map((zone) => (
                                        <ReferenceArea
                                            key={zone.label}
                                            y1={zone.y1}
                                            y2={zone.y2}
                                            fill={zone.color}
                                            fillOpacity={0.3}
                                            label={{ value: zone.label, position: 'insideTopLeft', fill: zone.labelColor, fontSize: 12 }}
                                            stroke={zone.labelColor}
                                            strokeOpacity={0.2}
                                        />
                                    ))}
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                    />
                                    <YAxis
                                        domain={userHeight ? [0, Math.max(maxZoneWeight, ...weights.map(w => w.weight))] : ['dataMin - 1', 'dataMax + 1']}
                                        tickFormatter={(value) => value}
                                        label={{ value: `Weight (${unit})`, angle: -90, position: 'insideLeft' }}
                                    />
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(value) => {
                                                    return new Date(value).toLocaleDateString("en-US", {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                    })
                                                }}
                                            />
                                        }
                                        cursor={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="weight"
                                        strokeWidth={2}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <BMIWidget refreshKey={refreshKey} />
            </div>
        </div>
    );
}
