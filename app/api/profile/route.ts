
import { auth } from "@/auth";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    const userId = (
      session?.user as { id?: string } | undefined
    )?.id;

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const users = await sql`
      SELECT id, name, email
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (users.length === 0) {
      return Response.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return Response.json({ user: users[0] });
  } catch (error) {
    console.error("Profile GET error:", error);

    return Response.json(
      { error: "Unable to retrieve profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();

    const userId = (
      session?.user as { id?: string } | undefined
    )?.id;

    if (!userId) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return Response.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const users = await sql`
      UPDATE users
      SET name = ${name}
      WHERE id = ${userId}
      RETURNING id, name, email
    `;

    if (users.length === 0) {
      return Response.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return Response.json({
      message: "Profile updated successfully",
      user: users[0],
    });
  } catch (error) {
    console.error("Profile PUT error:", error);

    return Response.json(
      { error: "Unable to update profile" },
      { status: 500 }
    );
  }
}
