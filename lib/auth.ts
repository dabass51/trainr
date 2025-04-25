import { NextAuthOptions } from "next-auth"
import StravaProvider from "next-auth/providers/strava"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import EmailProvider from "next-auth/providers/email"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as unknown as import("next-auth/adapters").Adapter,
    providers: [
        StravaProvider({
            clientId: process.env.STRAVA_CLIENT_ID!,
            clientSecret: process.env.STRAVA_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: 'read,activity:read_all',
                },
            },
        }),
        EmailProvider({
            server: {
                host: 'smtp.ionos.de',
                port: 587,
                auth: {
                    user: 'noreply@trainingsplatz.com',
                    pass: process.env.SMTP_PASSWORD,
                },
                secure: false,
                requireTLS: true,
            },
            from: 'noreply@trainingsplatz.com',
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            if (!user.email) return false;
            
            try {
                // Always fetch or create user in database
                const dbUser = await prisma.user.findUnique({
                    where: { email: user.email },
                });

                if (dbUser) {
                    user.id = dbUser.id;
                    return true;
                }

                const newUser = await prisma.user.create({
                    data: {
                        email: user.email,
                        name: user.name || null,
                    },
                });

                user.id = newUser.id;
                return true;
            } catch (error) {
                console.error('Error in signIn callback:', error);
                return false;
            }
        },
        async jwt({ token, user, account }) {
            try {
                if (user) {
                    // On sign in, use the ID from the database user
                    token.id = user.id;
                    token.email = user.email;
                } else if (token.email && !token.id) {
                    // If we don't have a user ID but have an email, fetch from DB
                    const dbUser = await prisma.user.findUnique({
                        where: { email: token.email },
                        select: { id: true }
                    });
                    
                    if (dbUser) {
                        token.id = dbUser.id;
                    }
                }
                
                if (account?.access_token) {
                    token.accessToken = account.access_token;
                }
                
                return token;
            } catch (error) {
                console.error('Error in jwt callback:', error);
                return token;
            }
        },
        async session({ session, token }) {
            try {
                if (session.user && token.id) {
                    session.user.id = token.id as string;
                }
                return session;
            } catch (error) {
                console.error('Error in session callback:', error);
                return session;
            }
        }
    },
    pages: {
        signIn: "/auth/signin",
        verifyRequest: "/auth/verify-request",
    },
    debug: process.env.NODE_ENV === "development",
}
