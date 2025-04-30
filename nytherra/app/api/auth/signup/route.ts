import { forwardRequest } from "../../utils/forwardRequest";

export async function POST(req: Request) {
    return await forwardRequest(req, "signup")
}