
import { sql } from "@/lib/db";
import { auth } from "@/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const noteId = Number(id);

    if (!Number.isInteger(noteId) || noteId <= 0) {
      return Response.json({ error: "Invalid note ID" }, { status: 400 });
    }

    const { title, content } = await request.json();

    const notes = await sql`
      UPDATE notes
      SET title = ${title}, content = ${content ?? ""}
      WHERE id = ${noteId}
      AND user_id = ${session.user.email}
      RETURNING *
    `;

    if (notes.length === 0) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    return Response.json(notes[0]);
  } catch (error) {
    console.error("Update note error:", error);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const noteId = Number(id);

    if (!Number.isInteger(noteId) || noteId <= 0) {
      return Response.json({ error: "Invalid note ID" }, { status: 400 });
    }

    const notes = await sql`
      DELETE FROM notes
      WHERE id = ${noteId}
      AND user_id = ${session.user.email}
      RETURNING id
    `;

    if (notes.length === 0) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    return Response.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}
