import { getDataFromToken } from "@/lib/getDataFromToken";
import { dbConnect } from "@/lib/dbConnect";
import {VaultItem} from "@/models/VaultItem";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    await dbConnect();
    try {
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { encryptedData , tags } = await request.json();
        if (!encryptedData) {
            return NextResponse.json({ error: "Encrypted data is required" }, { status: 400 });
        }
        
        const newVaultItem = new VaultItem({
            userId,
            encryptedData,
            tags: tags || [],
        });

        const savedItem = await newVaultItem.save();

        return NextResponse.json({
            message: "Item saved successfully",
            success: true,
            item: savedItem,
        }, { status: 201 });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}


export async function GET(request: NextRequest) {
    await dbConnect();
    try {
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const vaultItems = await VaultItem.find({ userId: userId });

        return NextResponse.json({
            message: "Items fetched successfully",
            success: true,
            items: vaultItems,
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}