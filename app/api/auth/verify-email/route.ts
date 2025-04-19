import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required.' }, { status: 400 });
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return NextResponse.json({ error: 'Token is invalid or has expired.' }, { status: 400 });
  }

  // Set emailVerified for the user
  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  // Delete the token
  await prisma.verificationToken.delete({ where: { token } });

  // Optionally, redirect to a confirmation page or show a message
  return NextResponse.json({ message: 'Email verified successfully. You can now log in.' });
} 