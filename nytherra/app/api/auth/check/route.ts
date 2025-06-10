import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        // Get token from cookies
        const token = req.cookies.get('token')?.value;
        
        if (!token) {
            return NextResponse.json({ authenticated: false });
        }

        // Optionally verify the token with your auth service
        // For now, just check if token exists
        // You can add more validation here if needed
        try {
            // If you want to verify the token with your auth service:
            // const response = await fetch(`${process.env.AUTH_SERVICE_URL}/verify`, {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': `Bearer ${token}`,
            //         'Content-Type': 'application/json'
            //     }
            // });
            // 
            // if (!response.ok) {
            //     return NextResponse.json({ authenticated: false });
            // }

            return NextResponse.json({ authenticated: true });
        } catch (error) {
            console.error('Token verification error:', error);
            return NextResponse.json({ authenticated: false });
        }
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ authenticated: false }, { status: 500 });
    }
}