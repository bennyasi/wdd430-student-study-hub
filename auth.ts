
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
        const email = credentials.email as string;
        const password = credentials.password as string;

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
          user.password as string
        );

        if (!isValid) {
          return null;
        }

        return {
          id: String(user.id),
          name: user.name as string,
          email: user.email as string,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },
});
