
import { sql } from "@/lib/db";
import { auth } from "@/auth";

// GET all notes for the logged-in user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json([], { status: 200 });
    }

    const notes = await sql`
      SELECT *
      FROM notes
      WHERE user_id = ${session.user.email}
      ORDER BY created_at DESC
    `;

    return Response.json(notes);
  } catch (error) {
    console.error("GET notes error:", error);

    return Response.json(
      { error: "Failed to load notes" },
      { status: 500 }
    );
  }
}

// CREATE a new note
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, content } = await req.json();

    if (!title) {
      return Response.json(
        { error: "A note title is required" },
        { status: 400 }
      );
    }

    const notes = await sql`
      INSERT INTO notes (title, content, user_id)
      VALUES (${title}, ${content ?? ""}, ${session.user.email})
      RETURNING *
    `;

    return Response.json(notes[0], { status: 201 });
  } catch (error) {
    console.error("POST notes error:", error);

    return Response.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
