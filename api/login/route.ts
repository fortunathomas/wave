import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const client = new MongoClient(process.env.MONGODB_URI!);

export async function POST(req: Request) {
    const { password } = await req.json();

    await client.connect();
    const db = client.db("auth");
    const user = await db.collection("users").findOne({ username: "admin" });

    if (!user) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    // GG twin
    const res = NextResponse.json({ ok: true });
    res.cookies.set("auth", "true", { httpOnly: true });
    return res;
}
