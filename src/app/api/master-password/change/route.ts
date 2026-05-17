import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/User";
import { decryptData, encryptData } from "@/lib/crypto";

const changeSchema = z.object({
    currentMasterPassword: z.string().min(8, { message: "Current master password is required" }),
    newMasterPassword: z.string()
        .min(8, { message: "New master password must be at least 8 characters long" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            { message: "New master password must contain uppercase, lowercase, number, and special character" }
        )
});

export async function POST(request: NextRequest) {
    await dbConnect();
    try {
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validation = changeSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { currentMasterPassword, newMasterPassword } = validation.data;

        const user = await User.findById(userId).select("masterPasswordHash vaultKeyEncrypted");
        if (!user || !user.masterPasswordHash || !user.vaultKeyEncrypted) {
            return NextResponse.json({ error: "Master password not set" }, { status: 400 });
        }

        const isMatch = await bcrypt.compare(currentMasterPassword, user.masterPasswordHash);
        if (!isMatch) {
            return NextResponse.json({ error: "Invalid master password" }, { status: 401 });
        }

        const { vaultKey } = decryptData<{ vaultKey: string }>(user.vaultKeyEncrypted, currentMasterPassword);
        const newVaultKeyEncrypted = encryptData({ vaultKey }, newMasterPassword);
        const newMasterPasswordHash = await bcrypt.hash(newMasterPassword, 12);

        user.masterPasswordHash = newMasterPasswordHash;
        user.vaultKeyEncrypted = newVaultKeyEncrypted;
        await user.save();

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
