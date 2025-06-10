import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const response = new NextResponse(JSON.stringify({ message: 'Logged out' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
        response.cookies.set({
            name: 'token',
            value: '',
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 0,
        });
        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ message: 'Server error during logout' }, { status: 500 });
    }
}