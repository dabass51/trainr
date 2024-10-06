'use client'

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeightEntry } from '@prisma/client';
import { Card, CardTitle, CardDescription, CardHeader,CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
type WeightUnit = "kg" | "lbs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
export default function WeightPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [weight, setWeight] = useState<string>('');
    const [weights, setWeights] = useState<WeightEntry[]>([]);
    const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

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
            const data = await res.json();
            setWeights((prevWeights) => [...prevWeights, data]);
            setWeight('');
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

    // const chartData = weights.map((entry: WeightEntry) => ({
    //     date: format(new Date(entry.date), 'yyyy-MM-dd'),
    //     weight: entry.unit === 'kg' ? entry.weight : entry.weight / 2.205,
    // }));

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (status === 'unauthenticated') {
        router.push('/auth/signin');
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">

            <Card>
                <CardHeader>
                    <CardTitle>Enter Today's Weight</CardTitle>
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
                <CardContent>
                    <ChartContainer
                        config={{
                            weight: {
                                label: `Weight (${unit})`,
                                color: "hsl(var(--chart-1))",
                            },
                        }}
                        className="h-[300px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weights}>
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                />
                                <YAxis
                                    domain={['dataMin - 1', 'dataMax + 1']}
                                    tickFormatter={(value) => value}
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
        </div>
    );
}
