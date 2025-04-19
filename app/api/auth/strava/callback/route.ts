import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        // Get the current session
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { code } = await request.json();
        if (!code) {
            return new NextResponse('Missing authorization code', { status: 400 });
        }

        // Exchange the authorization code for tokens
        const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
                client_secret: process.env.STRAVA_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code'
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Failed to exchange token:', errorText);
            return new NextResponse(`Failed to exchange token: ${errorText}`, { status: 400 });
        }

        const tokens = await tokenResponse.json();
        console.log('Successfully exchanged code for tokens');

        // Store the tokens in the database
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                stravaAccessToken: tokens.access_token,
                stravaRefreshToken: tokens.refresh_token,
                stravaTokenExpiresAt: new Date(tokens.expires_at * 1000), // Convert Unix timestamp to Date
            },
        });

        console.log('Successfully stored Strava tokens in database');
        return new NextResponse('OK', { status: 200 });
    } catch (error) {
        console.error('Error in Strava callback:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
} 