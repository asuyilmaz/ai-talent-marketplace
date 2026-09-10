import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE_NAME = "talnivo_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  role: "candidate" | "employer";
  expiresAt: number;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set and contain at least 32 characters."
    );
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

export function createSessionToken(
  userId: string,
  role: "candidate" | "employer"
) {
  const payload: SessionPayload = {
    userId,
    role,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  };

  const encodedPayload = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64url");

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifySessionToken(
  token: string | undefined
): SessionPayload | null {
  if (!token) return null;

  try {
    const [encodedPayload, signature] = token.split(".");

    if (!encodedPayload || !signature) return null;

    const expectedSignature = sign(encodedPayload);
    const received = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);

    if (
      received.length !== expected.length ||
      !timingSafeEqual(received, expected)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as SessionPayload;

    if (
      !payload.userId ||
      (payload.role !== "candidate" && payload.role !== "employer") ||
      !payload.expiresAt ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request: Request): SessionPayload | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = cookieHeader.split(";").map((part) => part.trim());
  const prefix = `${SESSION_COOKIE_NAME}=`;
  const cookie = cookies.find((part) => part.startsWith(prefix));
  if (!cookie) return null;
  return verifySessionToken(decodeURIComponent(cookie.slice(prefix.length)));
}
