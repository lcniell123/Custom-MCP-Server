// /backend/shared/auth.js

function getUserFromHeaders(req) {
  const header = req.headers["x-ms-client-principal"];
  if (!header) {
    const error = new Error("Authentication header missing");
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = Buffer.from(header, "base64").toString("utf8");
  } catch (err) {
    const error = new Error("Failed to decode authentication header");
    error.statusCode = 400;
    throw error;
  }

  let principal;
  try {
    principal = JSON.parse(decoded);
  } catch (err) {
    const error = new Error("Failed to parse authentication header JSON");
    error.statusCode = 400;
    throw error;
  }

  if (!principal.claims || !Array.isArray(principal.claims)) {
    const error = new Error("Invalid authentication claims");
    error.statusCode = 400;
    throw error;
  }

  const oidClaim = principal.claims.find((c) => c.typ === "oid");
  const subClaim = principal.claims.find((c) => c.typ === "sub");
  const emailClaim = principal.claims.find(
    (c) => c.typ === "preferred_username"
  );

  // Use oid if available, fallback to sub
  const userId = oidClaim?.val || subClaim?.val;

  if (!userId) {
    const error = new Error("User ID claim (oid/sub) missing");
    error.statusCode = 401;
    throw error;
  }

  return {
    userId,
    email: emailClaim ? emailClaim.val : null,
  };
}

module.exports = {
  getUserFromHeaders,
};
