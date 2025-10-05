import {dbConnect} from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { email, password } = await request.json();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return Response.json(
                { success: false, message: "User already exists with this email." },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            email,
            password_hash: hashedPassword,
        });

        await newUser.save();

        return Response.json(
            { success: true, message: "User registered successfully." },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error registering user:", error);
        return Response.json(
            { success: false, message: "Error registering user." },
            { status: 500 }
        );
    }
}