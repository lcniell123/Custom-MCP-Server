const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = async function (context, req) {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = process.env.AZURE_BLOB_CONTAINER_NAME;

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

  const userId = "testuser";
  const blobName = `${userId}/${req.body.filename}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const buffer = Buffer.from(req.body.content, "base64");

  await blockBlobClient.uploadData(buffer);

  context.res = {
    status: 200,
    body: `Uploaded file: ${blobName}`,
  };
};
