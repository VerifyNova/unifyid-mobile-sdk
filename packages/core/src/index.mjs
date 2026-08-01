import { createHash, randomBytes } from "node:crypto";

const base64url = value =>
  Buffer.from(value).toString("base64url");

export const createTransaction = ({
  clientId,
  redirectUri,
  scopes = ["openid", "profile"],
  purpose,
  authorizeUrl = "http://localhost:3000/v1/oauth/authorize",
}) => {
  if (!clientId || !redirectUri) throw new Error("clientId and redirectUri are required.");
  const state = base64url(randomBytes(32));
  const nonce = base64url(randomBytes(32));
  const codeVerifier = base64url(randomBytes(64));
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  const url = new URL(authorizeUrl);
  Object.entries({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(" "),
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    purpose,
  }).forEach(([key, value]) => value && url.searchParams.set(key, value));
  return {
    authorizationUrl: url.toString(),
    state,
    nonce,
    codeVerifier,
    redirectUri,
    createdAt: Date.now(),
  };
};

export const completeTransaction = (callbackUrl, transaction, now = Date.now()) => {
  const callback = new URL(callbackUrl);
  if (!transaction || now - transaction.createdAt > 10 * 60 * 1000)
    throw new Error("The authorization transaction has expired.");
  if (callback.searchParams.get("state") !== transaction.state)
    throw new Error("The authorization state does not match.");
  const error = callback.searchParams.get("error");
  if (error)
    throw new Error(callback.searchParams.get("error_description") || error);
  const code = callback.searchParams.get("code");
  if (!code) throw new Error("The authorization callback has no code.");
  return {
    code,
    codeVerifier: transaction.codeVerifier,
    redirectUri: transaction.redirectUri,
    nonce: transaction.nonce,
  };
};

export const exchangeCode = async ({
  apiBaseUrl = "http://localhost:3000",
  clientId,
  code,
  codeVerifier,
  redirectUri,
  fetchImpl = fetch,
}) => {
  const response = await fetchImpl(`${apiBaseUrl}/v1/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: clientId,
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error_description || body.error || "Token exchange failed.");
  return body;
};

export const getUserInfo = async ({
  apiBaseUrl = "http://localhost:3000",
  accessToken,
  fetchImpl = fetch,
}) => {
  const response = await fetchImpl(`${apiBaseUrl}/v1/userinfo`, {
    headers: { authorization: `Bearer ${accessToken}`, accept: "application/json" },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || body.error || "UserInfo request failed.");
  return body;
};

