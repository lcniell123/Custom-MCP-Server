const { listMetadata } = require("../shared/storage");
const { getUserFromHeaders } = require("../shared/auth");

module.exports = async function (context, req) {
  let userId, email;
  try {
    ({ userId, email } = getUserFromHeaders(req));
  } catch (err) {
    console.log("Claims missing—using testuser fallback");
    userId = "testuser";
    email = "test@example.com";
  }

  const files = await listMetadata(userId);

  context.res = {
    status: 200,
    body: files,
  };
};
