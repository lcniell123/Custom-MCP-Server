const { BlobServiceClient } = require("@azure/storage-blob");
const { insertMetadata } = require("../shared/storage");
const { getUserFromHeaders } = require("../shared/auth");

module.exports = async function (context, req) {
  const connectionString = process.env.AzureWebJobsStorage;
  const containerName = process.env.AZURE_BLOB_CONTAINER_NAME;

  if (!connectionString) {
    context.res = {
      status: 500,
      body: "AzureWebJobsStorage is not set.",
    };
    return;
  }

  if (!req.body || !req.body.filename || !req.body.content) {
    context.res = {
      status: 400,
      body: "Missing filename or content.",
    };
    return;
  }

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  let userId, email;
  try {
    ({ userId, email } = getUserFromHeaders(req));
  } catch (err) {
    console.log("Claims missing—using testuser fallback");
    userId = "testuser";
    email = "test@example.com";
  }

  const blobName = `${userId}/${req.body.filename}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const buffer = Buffer.from(req.body.content, "base64");

  await blockBlobClient.uploadData(buffer);
  await insertMetadata(userId, req.body.filename, buffer.length);

  context.res = {
    status: 200,
    body: `Uploaded file: ${blobName}`,
  };
};
