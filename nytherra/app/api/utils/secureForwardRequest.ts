import { NextRequest, NextResponse } from 'next/server';

export async function secureForwardRequest(
    method: 'POST' | 'GET',
    req: NextRequest,
    baseUrlEnvKey: string,
    endpoint?: string
) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return new NextResponse(JSON.stringify({
                data: null,
                status: 'notok',
                error: 'No authentication token found'
            }), { status: 401 });
        }
        const data = method === 'POST' ? await req.json() : null;
        const ENV_URL = process.env[baseUrlEnvKey];

        if (!ENV_URL) {
            throw new Error(`Missing environment variable: ${baseUrlEnvKey}`);
        }

        const resp = await fetch(`${ENV_URL}/${endpoint}`, {
            method: method,
            ...(method === 'POST' ? { body: JSON.stringify(data) } : {}),
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            }
        });
        let result = null;
        try {
            result = await resp.json();
        } catch (error) {
            console.log("secureForwardRequest result:", result);
            console.log("await resp.json() " + (error as Error).message);
        }
        return new NextResponse(JSON.stringify({
            status: resp.ok ? 'ok' : 'notok',
            data: result || null
        }), {
            status: resp.status,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        console.error('JWT Error:', error);
        return new NextResponse(JSON.stringify({ data: null, status: 'notok' }), { status: 500 });
    }
}