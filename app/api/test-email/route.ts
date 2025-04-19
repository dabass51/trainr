import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET() {
    try {
        // Create test SMTP transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.ionos.de',
            port: 587,
            auth: {
                user: 'noreply@trainingsplatz.de',
                pass: process.env.SMTP_PASSWORD,
            },
        })

        // Verify SMTP configuration
        const verification = await transporter.verify()
        console.log('SMTP Configuration verified:', verification)
        console.log('SMTP Password length:', process.env.SMTP_PASSWORD?.length || 0)

        return NextResponse.json({ 
            success: true, 
            message: 'SMTP configuration verified successfully',
            smtpPasswordSet: !!process.env.SMTP_PASSWORD
        })
    } catch (error) {
        console.error('SMTP verification error:', error)
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error',
            smtpPasswordSet: !!process.env.SMTP_PASSWORD
        }, { status: 500 })
    }
} 