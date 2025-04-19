// app/profile/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProfileForm from '@/components/ProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stravaConnected, setStravaConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (session?.user?.id) {
            // Check for Strava OAuth callback
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            const error = urlParams.get('error');

            if (error) {
                console.error('Strava OAuth error:', error);
                toast({
                    title: "Connection Failed",
                    description: "Failed to connect to Strava. Please try again.",
                    variant: "destructive",
                });
                // Clear the URL parameters
                window.history.replaceState({}, '', '/profile');
                return;
            }

            if (code && state === 'profile') {
                setIsSyncing(true);
                // Exchange the code for tokens
                fetch('/api/auth/strava/callback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code }),
                })
                .then(response => {
                    if (response.ok) {
                        setStravaConnected(true);
                        toast({
                            title: "Connected to Strava",
                            description: "Successfully connected your Strava account.",
                        });
                        // After successful connection, sync activities
                        return fetch('/api/activities/strava');
                    } else {
                        throw new Error('Failed to connect Strava');
                    }
                })
                .then(response => {
                    if (response && response.ok) {
                        return response.json();
                    }
                })
                .then(activities => {
                    if (activities) {
                        toast({
                            title: "Activities Synced",
                            description: `Successfully synced ${activities.length} activities from Strava.`,
                        });
                    }
                })
                .catch(error => {
                    console.error('Failed to connect or sync with Strava:', error);
                    toast({
                        title: "Connection Failed",
                        description: "Failed to connect to Strava. Please try again.",
                        variant: "destructive",
                    });
                })
                .finally(() => {
                    setIsSyncing(false);
                    // Clear the URL parameters
                    window.history.replaceState({}, '', '/profile');
                });
            } else {
                checkStravaConnection();
            }
        }
    }, [session]);

    const checkStravaConnection = async () => {
        try {
            const response = await fetch('/api/activities/strava');
            setStravaConnected(response.ok);
        } catch (error) {
            setStravaConnected(false);
        }
    };

    const handleStravaSync = async () => {
        if (!stravaConnected) {
            // Directly initiate Strava OAuth flow using their authorization endpoint
            const params = new URLSearchParams({
                client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || '',
                redirect_uri: `${window.location.origin}/profile`,
                response_type: 'code',
                approval_prompt: 'auto',
                scope: 'activity:read_all,activity:write',
                state: 'profile' // To verify the callback is legitimate
            });
            
            window.location.href = `https://www.strava.com/oauth/authorize?${params.toString()}`;
            return;
        }

        setIsSyncing(true);
        try {
            const response = await fetch('/api/activities/strava');
            if (response.ok) {
                const activities = await response.json();
                toast({
                    title: "Activities Synced",
                    description: `Successfully synced ${activities.length} activities from Strava.`,
                });
            } else {
                throw new Error('Failed to sync activities');
            }
        } catch (error) {
            console.error('Failed to sync activities:', error);
            toast({
                title: "Sync Failed",
                description: "Failed to sync activities from Strava. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSyncing(false);
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
        router.push('/api/auth/signin');
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>
                        Complete your profile to get personalized training plans
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>External Integrations</CardTitle>
                    <CardDescription>
                        Connect your accounts to automatically import activities
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium">Strava</h3>
                                <p className="text-sm text-muted-foreground">
                                    {stravaConnected 
                                        ? 'Connected. Click to sync activities.' 
                                        : 'Connect to import your Strava activities.'}
                                </p>
                            </div>
                            <Button 
                                onClick={handleStravaSync}
                                variant={stravaConnected ? "default" : "secondary"}
                                disabled={isSyncing}
                            >
                                {isSyncing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Syncing...
                                    </>
                                ) : (
                                    stravaConnected ? 'Sync Activities' : 'Connect Strava'
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
