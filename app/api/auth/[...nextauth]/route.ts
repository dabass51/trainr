// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import EmailProvider from "next-auth/providers/email"
import { getVerificationEmailTemplate, getMagicLinkEmailTemplate } from "@/lib/email-templates"
import nodemailer from "nodemailer"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.SMTP_FROM,
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        const { host } = new URL(url)
        const transport = nodemailer.createTransport(provider.server)
        
        // Determine if this is a sign-in or verification email
        const isSignIn = url.includes("signin")
        const emailTemplate = isSignIn
          ? getMagicLinkEmailTemplate({ url, host })
          : getVerificationEmailTemplate({ url, host })

        await transport.sendMail({
          to: email,
          from: provider.from,
          subject: isSignIn ? "Sign in to Trainer" : "Verify your email for Trainer",
          html: emailTemplate,
        })
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }
