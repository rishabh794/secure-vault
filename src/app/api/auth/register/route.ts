import {dbConnect} from "@/lib/dbConnect";
import {User} from "@/models/User";
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        })
});

export async function POST(request: Request) {
    await dbConnect();

    try {
        const body = await request.json();
        
        const validation = registerSchema.safeParse(body);
        if (!validation.success) {
            return Response.json({ 
                success: false, 
                message: validation.error.issues[0].message 
            }, { status: 400 });
        }

         const { email, password } = validation.data;

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