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
        let result=null;
        try {
            result = await resp.json();
            console.log("forwardRequest(result): ",result);
        } catch (error) {
            console.log("forwardRequest(result error): ",+ (error as Error).message);
        }
        if(result?.error){
            return new Response(JSON.stringify({ data: result, status: 'notok' }));
        }
        return new Response(JSON.stringify({ data: result, status: 'ok' }));
    } catch (error) {
        console.warn(error);
        return new Response(JSON.stringify({ data: null, status: 'notok' }), { status: 500 });
    }
}