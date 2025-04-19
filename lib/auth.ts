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
    },
    pages: {
        signIn: "/auth/signin",
        verifyRequest: "/auth/verify-request",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
            }
            return session
        },
    },
}
