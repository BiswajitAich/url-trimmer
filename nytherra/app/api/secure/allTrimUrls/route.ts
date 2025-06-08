import { NextRequest } from 'next/server';
import { secureForwardRequest } from '../../utils/secureForwardRequest';

export async function GET(req: NextRequest) {
    return await secureForwardRequest('GET', req, 'INTERNAL_TRIM_URL', 'trimUrls')
}
