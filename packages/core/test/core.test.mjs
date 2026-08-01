import test from "node:test";
import assert from "node:assert/strict";
import { completeTransaction, createTransaction } from "../src/index.mjs";

test("creates an S256 authorization transaction", () => {
  const transaction = createTransaction({
    clientId: "vid_sandbox_test",
    redirectUri: "unifyid-demo://callback",
    scopes: ["openid", "email"],
  });
  const url = new URL(transaction.authorizationUrl);
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.equal(url.searchParams.get("scope"), "openid email");
  assert.ok(transaction.codeVerifier.length > 43);
});

test("rejects a callback with the wrong state", () => {
  const transaction = createTransaction({
    clientId: "vid_sandbox_test",
    redirectUri: "unifyid-demo://callback",
  });
  assert.throws(
    () => completeTransaction("unifyid-demo://callback?code=abc&state=wrong", transaction),
    /state does not match/,
  );
});

test("returns the code and verifier once callback state matches", () => {
  const transaction = createTransaction({
    clientId: "vid_sandbox_test",
    redirectUri: "unifyid-demo://callback",
  });
  const result = completeTransaction(
    `unifyid-demo://callback?code=abc&state=${transaction.state}`,
    transaction,
  );
  assert.equal(result.code, "abc");
  assert.equal(result.codeVerifier, transaction.codeVerifier);
});

