import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret });

  if (!token || !token.sub) {
    return new Response(
      JSON.stringify({ error: "User wallet not authenticated" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      sub: token.sub,
      content:
        "This is protected content. You can access this content because you are signed in with your Solana Wallet.",
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
