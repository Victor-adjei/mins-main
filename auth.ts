import NextAuth, { DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';

declare module 'next-auth' {
  interface Session {
    user: {
      role: string;
    } & DefaultSession['user'];
  }
  interface User {
    role: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        
        const res = await query(
          'SELECT * FROM users WHERE username = $1 LIMIT 1',
          [credentials.username]
        );
        const user = res.rows[0];
        if (!user) return null;

        // Support both plain-text (legacy) and bcrypt passwords
        let valid = false;
        if (user.password.startsWith('$2')) {
          valid = await bcrypt.compare(credentials.password as string, user.password);
        } else {
          valid = credentials.password === user.password;
        }

        if (!valid) return null;

        return {
          id: String(user.user_number),
          name: user.username,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
});
