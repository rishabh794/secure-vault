import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
    await dbConnect();
    try {
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { masterPassword } = await request.json();
        if (!masterPassword) {
            return NextResponse.json({ error: "Master password is required" }, { status: 400 });
        }

        const user = await User.findById(userId).select("masterPasswordHash vaultKeyEncrypted");
        if (!user || !user.masterPasswordHash || !user.vaultKeyEncrypted) {
            return NextResponse.json({ error: "Master password not set" }, { status: 400 });
        }

        const isMatch = await bcrypt.compare(masterPassword, user.masterPasswordHash);
        if (!isMatch) {
            return NextResponse.json({ error: "Invalid master password" }, { status: 401 });
        }

        return NextResponse.json({ vaultKeyEncrypted: user.vaultKeyEncrypted }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
