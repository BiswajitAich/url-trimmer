import { NextRequest } from 'next/server';
import { secureForwardRequest } from '../../utils/secureForwardRequest';

export async function POST(req: NextRequest) {
    return await secureForwardRequest('POST', req, 'NEXT_PUBLIC_trim_URL', "url");
}
