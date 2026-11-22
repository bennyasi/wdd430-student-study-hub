
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        const email = String(credentials.email ?? "").trim().toLowerCase();
        const password = String(credentials.password ?? "");

        if (!email || !password) {
          return null;
        }

        const users = await sql`
          SELECT id, name, email, password
          FROM users
          WHERE email = ${email}
          LIMIT 1
        `;

        const user = users[0];

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(
          password,
          String(user.password)
        );

        if (!isValid) {
          return null;
        }

        return {
          id: String(user.id),
          name: String(user.name),
          email: String(user.email),
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        (token as typeof token & { id?: string }).id = user.id;
      }

      return token;
    },

    session({ session, token }) {
      if (session.user && token.id) {
        (session.user as typeof session.user & { id: string }).id =
          String(token.id);
      }

      return session;
    },
  },
});
