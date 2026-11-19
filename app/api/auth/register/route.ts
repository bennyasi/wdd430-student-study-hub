
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return Response.json(
        { error: "Please provide name, email, and password" },
        { status: 400 }
      );
    }

    const existingUsers = await sql`
      SELECT id FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (existingUsers.length > 0) {
      return Response.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const users = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
      RETURNING id, name, email
    `;

    return Response.json(
      { message: "User created", user: users[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return Response.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
