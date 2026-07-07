import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/User";

export async function GET(request: NextRequest) {
    await dbConnect();
    try {
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findById(userId).select("masterPasswordHash vaultKeyEncrypted");
        const hasMasterPassword = Boolean(user?.masterPasswordHash && user?.vaultKeyEncrypted);

        return NextResponse.json({ hasMasterPassword }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
