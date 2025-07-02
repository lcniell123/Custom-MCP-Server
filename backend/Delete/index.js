const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = async function (context, req) {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = process.env.AZURE_BLOB_CONTAINER_NAME;

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

  // TEMP: Hardcode userId (you'll replace with auth later)
  const userId = "testuser";
  const blobName = `${userId}/${req.query.filename}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    await blockBlobClient.deleteIfExists();
    context.res = {
      status: 200,
      body: `Deleted file: ${blobName}`,
    };
  } catch (err) {
    context.res = {
      status: 500,
      body: `Error deleting file: ${err.message}`,
    };
  }
};
