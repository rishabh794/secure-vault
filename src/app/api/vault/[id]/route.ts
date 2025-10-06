import { getDataFromToken } from "@/lib/getDataFromToken";
import { dbConnect } from "@/lib/dbConnect";
import { VaultItem } from "@/models/VaultItem";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const itemId = params.id;
        const itemToDelete = await VaultItem.findById(itemId);

        if (!itemToDelete) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }
        
        if (itemToDelete.userId.toString() !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        
        await VaultItem.findByIdAndDelete(itemId);

        return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    await dbConnect();
    try {
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const itemId = params.id;
        const { encryptedData , tags } = await request.json();

        const itemToUpdate = await VaultItem.findById(itemId);

        if (!itemToUpdate) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        if (itemToUpdate.userId.toString() !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        itemToUpdate.encryptedData = encryptedData;
        itemToUpdate.tags = tags || [];
        await itemToUpdate.save();

        return NextResponse.json({ message: "Item updated successfully" }, { status: 200 });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}