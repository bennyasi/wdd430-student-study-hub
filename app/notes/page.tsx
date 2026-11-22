
"use client";

import { useState, useEffect } from "react";

interface Note {
  _id: string;
  title: string;
  content: string;
}

export default function NotesPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);

  async function loadNotes() {
    try {
      const res = await fetch("/api/notes");

      if (!res.ok) {
        console.error("Failed to load notes");
        return;
      }

      const data: Note[] = await res.json();
      setNotes(data);
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  }

  async function createNote() {
    if (!title.trim() || !content.trim()) {
      alert("Please enter a title and content.");
      return;
    }

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      if (!res.ok) {
        alert("Failed to create note.");
        return;
      }

      setTitle("");
      setContent("");

      await loadNotes();
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Something went wrong while creating the note.");
    }
  }

  async function deleteNote(id: string) {
    const confirmed = confirm("Are you sure you want to delete this note?");

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete note.");
        return;
      }

      await loadNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Something went wrong while deleting the note.");
    }
  }

  async function editNote(note: Note) {
    const newTitle = prompt("Edit title", note.title);

    if (newTitle === null) return;

    const newContent = prompt("Edit content", note.content);

    if (newContent === null) return;

    if (!newTitle.trim() || !newContent.trim()) {
      alert("Title and content cannot be empty.");
      return;
    }

    try {
      const res = await fetch(`/api/notes/${note._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
        }),
      });

      if (!res.ok) {
        alert("Failed to update note.");
        return;
      }

      await loadNotes();
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Something went wrong while updating the note.");
    }
  }

  useEffect(() => {
    let ignore = false;

    async function fetchNotes() {
      try {
        const res = await fetch("/api/notes");

        if (!res.ok) {
          throw new Error("Failed to load notes");
        }

        const data: Note[] = await res.json();

        if (!ignore) {
          setNotes(data);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Error loading notes:", error);
        }
      }
    }

    void fetchNotes();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">My Notes</h1>

      {/* Create Note */}
      <div className="mt-6 rounded border p-4 shadow">
        <input
          className="w-full rounded border p-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="mt-3 w-full rounded border p-2"
          placeholder="Content"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          className="mt-3 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={createNote}
        >
          Add Note
        </button>
      </div>

      {/* Notes List */}
      <div className="mt-8">
        {notes.length === 0 ? (
          <p className="text-gray-500">You have no notes yet.</p>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className="mb-4 rounded border p-4 shadow"
            >
              <h2 className="text-lg font-bold">{note.title}</h2>

              <p className="mt-2">{note.content}</p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => editNote(note)}
                  className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteNote(note._id)}
                  className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
