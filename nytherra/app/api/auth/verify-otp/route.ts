import { verifyOtpCode } from '@biswajitaich/email-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Verify-body:', body);
        const { email, otp } = body;

        if (!email || !otp) {
            return NextResponse.json({
                success: false,
                message: 'Missing required fields'
            }, { status: 400 });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Please provide a valid email address'
                },
                { status: 400 }
            );
        }

        // Validate OTP format (6 digits)
        const otpRegex = /^\d{6}$/;
        if (!otpRegex.test(otp)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'OTP must be 6 digits'
                },
                { status: 400 }
            );
        }
        const result = await verifyOtpCode(email, otp);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Email verified successfully',
                data: {
                    email,
                    verified: true,
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: result.message
                },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Verify OTP Error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error'
            },
            { status: 500 }
        );
    }
}