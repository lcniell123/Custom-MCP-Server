const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = async function (context, req) {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = process.env.AZURE_BLOB_CONTAINER_NAME;

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // TEMP: Hardcoded userId (replace with auth later)
  const userId = "testuser";
  const prefix = `${userId}/`;

  let files = [];

  for await (const blob of containerClient.listBlobsFlat({ prefix })) {
    files.push({
      name: blob.name.replace(prefix, ""), // remove the folder prefix
      size: blob.properties.contentLength,
      lastModified: blob.properties.lastModified,
    });
  }

  context.res = {
    status: 200,
    body: files,
  };
};
