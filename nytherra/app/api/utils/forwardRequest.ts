export async function forwardRequest(req: Request, endpoint: string) {
    try {
        const data = await req.json();

        const resp = await fetch(`${process.env.AUTH_SERVICE_URL}/${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        });
        let result = null;
        try {
            result = await resp.json();
        } catch (error) {
            console.log("forwardRequest(result error): ", + (error as Error).message);
        }
        if (result?.error) {
            return new Response(JSON.stringify({ data: result, status: 'notok' }));
        }
        if (result?.token && (endpoint === 'login' || endpoint === 'signup')) {
            const response = new Response(JSON.stringify({ data: result, status: 'ok' }));

            response.headers.set('Set-Cookie',
                `token=${result.token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24 * 1}` // 1 days
            );

            return response;
        }
        return new Response(JSON.stringify({ data: result, status: 'ok' }));
    } catch (error) {
        console.warn(error);
        return new Response(JSON.stringify({ data: null, status: 'notok' }), { status: 500 });
    }
}