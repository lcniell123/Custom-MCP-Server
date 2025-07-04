const { BlobServiceClient } = require("@azure/storage-blob");
const { deleteMetadata } = require("../shared/storage");
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

  if (!req.query || !req.query.filename) {
    context.res = {
      status: 400,
      body: "Missing filename parameter.",
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

  const blobName = `${userId}/${req.query.filename}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    await blockBlobClient.deleteIfExists();
    await deleteMetadata(userId, req.query.filename);

    context.res = {
      status: 200,
      body: `Deleted file and metadata for: ${blobName}`,
    };
  } catch (err) {
    context.res = {
      status: 500,
      body: `Error deleting file: ${err.message}`,
    };
  }
};
