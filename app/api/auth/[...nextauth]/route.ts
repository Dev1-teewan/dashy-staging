import { getCsrfToken } from "next-auth/react";
import NextAuth, { DefaultSession, User } from "next-auth";
import { SigninMessage } from "../../../utils/SigninMessage";
import CredentialsProvider from "next-auth/providers/credentials";

// Define custom user and session properties
interface CustomUser extends User {
  signature?: string | null;
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    wallet?: {
      pubKey?: string | null;
      signature?: string | null;
    };
  }
}

const providers = [
  CredentialsProvider({
    name: "Solana",
    credentials: {
      message: {
        label: "Message",
        type: "text",
      },
      signature: {
        label: "Signature",
        type: "text",
      },
    },
    async authorize(credentials, req) {
      try {
        const signinMessage = new SigninMessage(
          JSON.parse(credentials?.message || "{}")
        );

        const nextAuthUrl = new URL(process.env.NEXTAUTH_URL || "");
        if (signinMessage.domain !== nextAuthUrl.host) {
          return null;
        }

        const csrfToken = await getCsrfToken({ req: { ...req, body: null } });

        if (signinMessage.nonce !== csrfToken) {
          return null;
        }

        const validationResult = await signinMessage.validate(
          credentials?.signature || ""
        );

        if (!validationResult) {
          throw new Error("Could not validate the signed message");
        }

        return {
          id: signinMessage.publicKey,
          signature: credentials?.signature,
        };
      } catch (e) {
        return null;
      }
    },
  }),
];

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  callbacks: {
    async jwt({ token, user }) {
      // If the user is signed in, add the wallet info to the token
      if (user) {
        token.signature = (user as CustomUser).signature;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.sub || "";
        session.user.image = `https://ui-avatars.com/api/?name=${token.sub}`;

        // Adding the wallet layer
        session.wallet = {
          pubKey: token.sub || "",
          signature: typeof token.signature === "string" ? token.signature : "",
        };
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
