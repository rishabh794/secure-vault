import {dbConnect} from "@/lib/dbConnect";
import {User} from "@/models/User";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { email, password } = await request.json();

        const user = await User.findOne({ email });

        if (!user) {
            return Response.json(
                { success: false, message: "Invalid credentials" },
                { status: 400 }
            );
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordCorrect) {
            return Response.json(
                { success: false, message: "Invalid credentials" },
                { status: 400 }
            );
        }

        const tokenData = {
            id: user._id,
            email: user.email,
            isTwoFactorEnabled: user.isTwoFactorEnabled
        };

        const token = jwt.sign(tokenData, process.env.JWT_SECRET!, { expiresIn: '7d' });

        return Response.json(
            { success: true, message: "Login successful", token },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error logging in:", error);
        return Response.json(
            { success: false, message: "Error logging in" },
            { status: 500 }
        );
    }
}