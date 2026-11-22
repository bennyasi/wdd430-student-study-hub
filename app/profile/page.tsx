
"use client";

import { useEffect, useState } from "react";

interface Profile {
  id: string | number;
  name: string;
  email: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load profile");
        }

        setProfile(data.user);
        setName(data.user.name);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update profile");
      }

      setProfile(data.user);
      setName(data.user.name);
      setMessage(data.message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="mx-auto max-w-xl p-6">Loading profile...</main>;
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-bold">Student Profile</h1>
        <p role="alert" className="mt-4 text-red-600">
          {error || "Please log in to view your profile."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-3xl font-bold">Student Profile</h1>

      <p className="mt-2 text-gray-600">
        View and update your personal information.
      </p>

      <form onSubmit={handleUpdate} className="mt-6 space-y-5">
        <div>
          <label htmlFor="name" className="mb-2 block font-medium">
            Full Name
          </label>

          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 p-3"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block font-medium">
            Email Address
          </label>

          <input
            id="email"
            type="email"
            value={profile.email}
            readOnly
            className="w-full rounded-lg border border-gray-300 bg-gray-100 p-3"
          />

          <p className="mt-1 text-sm text-gray-500">
            Your email address cannot be changed here.
          </p>
        </div>

        {message && (
          <p role="status" className="text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </main>
  );
}
