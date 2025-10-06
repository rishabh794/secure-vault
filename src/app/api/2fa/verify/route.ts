import { getDataFromToken } from "@/lib/getDataFromToken";
import { dbConnect } from "@/lib/dbConnect";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import speakeasy from 'speakeasy';
import jwt from 'jsonwebtoken';

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

        const { token } = await request.json();

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret!,
            encoding: 'base32',
            token: token,
        });

        if (verified) {
            user.isTwoFactorEnabled = true;
            await user.save();

            const tokenData = {
                id: user._id,
                email: user.email,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
            };
            const newToken = jwt.sign(tokenData, process.env.JWT_SECRET!, { expiresIn: '7d' });

            return NextResponse.json({ success: true, message: "2FA enabled successfully!" , token: newToken});
        } else {
            return NextResponse.json({ success: false, message: "Invalid 2FA code. Please try again." }, { status: 400 });
        }

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}