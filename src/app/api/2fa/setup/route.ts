import { getDataFromToken } from "@/lib/getDataFromToken";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export async function POST(request: NextRequest) {
    await dbConnect();
    try {
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const secret = speakeasy.generateSecret({
            name: `SecureVault (${user.email})`,
        });

        user.twoFactorSecret = secret.base32;
        await user.save();

        const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url!);

        return NextResponse.json({
            message: "2FA setup initiated. Scan the QR code.",
            qrCodeUrl: qrCodeDataUrl,
        });

    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    }
}