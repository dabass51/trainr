'use client'

import { useState, useEffect, FormEvent } from 'react';
import { format } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { WeightEntry } from '@prisma/client';

export default function EditWeightPage() {
    const [weight, setWeight] = useState<string>('');
    const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const entryId = searchParams.get('weightId');

    useEffect(() => {
        const fetchWeightEntry = async () => {
            if (entryId) {
                const res = await fetch(`/api/weight?id=${entryId}`);
                if (res.ok) {
                    const data: WeightEntry = await res.json();
                    setWeight(data.weight.toString());
                    setUnit(data.unit);
                }
                setLoading(false);
            }
        };
        fetchWeightEntry();
    }, [entryId]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!entryId) return;

        const res = await fetch('/api/weight/edit', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: entryId, weight: parseFloat(weight), unit }),
        });

        if (res.ok) {
            router.push('/weight');
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

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Edit Weight Entry</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Enter Weight:
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Unit:
                    <select value={unit} onChange={(e) => handleUnitChange(e.target.value as 'kg' | 'lbs')}>
                        <option value="kg">Kilogram</option>
                        <option value="lbs">Pounds</option>
                    </select>
                </label>
                <button type="submit">Save Changes</button>
            </form>
            <Card className="mt-4">
                <h2>Editing Weight Entry</h2>
                <p>Weight: {weight} {unit}</p>
            </Card>
        </div>
    );
}
