import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Profile {
  height: number | null;
}

interface WeightEntry {
  weight: number;
  createdAt: string;
}

interface BMIWidgetProps {
  refreshKey?: number;
}

const BMIWidget: React.FC<BMIWidgetProps> = ({ refreshKey }) => {
  const [height, setHeight] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const profileRes = await fetch('/api/profile');
        if (!profileRes.ok) throw new Error('Failed to fetch profile');
        const profile: Profile = await profileRes.json();
        setHeight(profile.height ?? null);

        // Fetch all weights and use the latest entry
        const weightRes = await fetch('/api/weight');
        if (!weightRes.ok) throw new Error('Failed to fetch weight');
        const weightEntries: WeightEntry[] = await weightRes.json();
        // Sort by createdAt descending and take the first entry
        const latest = weightEntries
          .slice()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        setWeight(latest?.weight ?? null);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  let bmi: number | null = null;
  let maxNormalWeight: number | null = null;
  let minNormalWeight: number | null = null;
  let weightToLose: number | null = null;
  let weightToGain: number | null = null;
  if (height && weight) {
    // height in cm, convert to meters
    const heightM = height / 100;
    bmi = weight / (heightM * heightM);
    maxNormalWeight = 24.9 * heightM * heightM;
    minNormalWeight = 18.5 * heightM * heightM;
    if (weight > maxNormalWeight) {
      weightToLose = weight - maxNormalWeight;
    }
    if (weight < minNormalWeight) {
      weightToGain = minNormalWeight - weight;
    }
  }

  return (
    <Card className="max-w-md mx-auto mt-6">
      <CardContent className="py-6">
        <h2 className="text-xl font-bold mb-2">Your BMI</h2>
        {loading ? (
          <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <div className="mb-2">
              <span className="font-medium">Height:</span> {height ? `${height} cm` : 'Not set'}
            </div>
            <div className="mb-2">
              <span className="font-medium">Weight:</span> {weight ? `${weight} kg` : 'Not set'}
            </div>
            <div className="mb-2">
              <span className="font-medium">BMI:</span> {bmi ? bmi.toFixed(1) : 'N/A'}
            </div>
            {bmi && (
              <div className="text-sm text-muted-foreground mb-2">
                {bmi < 18.5 && 'Underweight'}
                {bmi >= 18.5 && bmi < 25 && 'Normal weight'}
                {bmi >= 25 && bmi < 30 && 'Overweight'}
                {bmi >= 30 && 'Obese'}
              </div>
            )}
            {weightToLose !== null && weightToLose > 0 && (
              <div className="text-sm text-red-600">
                You need to lose {weightToLose.toFixed(1)} kg to reach a normal BMI.
              </div>
            )}
            {weightToGain !== null && weightToGain > 0 && (
              <div className="text-sm text-blue-700">
                You need to gain {weightToGain.toFixed(1)} kg to reach a normal BMI.
              </div>
            )}
            {bmi && bmi < 25 && bmi >= 18.5 && (
              <div className="text-sm text-green-700">
                You are in the normal BMI range.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BMIWidget; 