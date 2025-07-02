const { listMetadata } = require("../shared/storage");

module.exports = async function (context, req) {
  const userId = "testuser";

  const files = await listMetadata(userId);

  context.res = {
    status: 200,
    body: files,
  };
};
