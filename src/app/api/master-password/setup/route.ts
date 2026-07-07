import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/User";
import { VaultItem } from "@/models/VaultItem";
import { encryptData, generateVaultKey } from "@/lib/crypto";

const strongMasterPasswordSchema = z.object({
    masterPassword: z.string()
        .min(8, { message: "Master password must be at least 8 characters long" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            { message: "Master password must contain uppercase, lowercase, number, and special character" }
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
        const validation = strongMasterPasswordSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.masterPasswordHash || user.vaultKeyEncrypted) {
            return NextResponse.json({ error: "Master password already set" }, { status: 409 });
        }

        const { masterPassword } = validation.data;
        const vaultKey = generateVaultKey();
        const vaultKeyEncrypted = encryptData({ vaultKey }, masterPassword);
        const masterPasswordHash = await bcrypt.hash(masterPassword, 12);

        user.masterPasswordHash = masterPasswordHash;
        user.vaultKeyEncrypted = vaultKeyEncrypted;
        await user.save();

        return NextResponse.json({ success: true, vaultKeyEncrypted }, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
