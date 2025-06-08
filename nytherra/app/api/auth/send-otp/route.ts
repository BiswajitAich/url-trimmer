import { sendOtpEmail } from '@biswajitaich/email-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex.test(email)) {
            return NextResponse.json({
                success: false,
                message: 'Please provide a valid email address'
            }, { status: 400 });
        }

        const result = await sendOtpEmail(email, "Nytherra");
        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'OTP sent successfully to your email'
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: result.message
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Send OTP Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error'
            },
            { status: 500 }
        );
    }
}
