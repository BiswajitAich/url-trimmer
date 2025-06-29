import { NextRequest, NextResponse } from 'next/server';
import { secureForwardRequest } from '../../utils/secureForwardRequest';

export async function POST(req: NextRequest) {
    try {
        const { trimId } = await req.json();
        return await secureForwardRequest('GET', req, 'INTERNAL_TRIM_URL', `analysis/${trimId}`);
    } catch (error) {
        console.error('JWT Error:', error);
        return new NextResponse(JSON.stringify({ data: null, status: 'notok' }), { status: 500 });
    }
}
