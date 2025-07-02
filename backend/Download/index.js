const {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");

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

  const userId = "testuser";
  const blobName = `${userId}/${req.query.filename}`;
  const blobClient = containerClient.getBlobClient(blobName);

  const expiry = new Date(new Date().valueOf() + 10 * 60 * 1000);

  const parsed = /AccountName=([^;]+);AccountKey=([^;]+)/.exec(
    connectionString
  );
  if (!parsed) {
    context.res = {
      status: 500,
      body: "Could not parse storage connection string.",
    };
    return;
  }
  const accountName = parsed[1];
  const accountKey = parsed[2];

  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
  );

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      expiresOn: expiry,
      protocol: SASProtocol.Https,
    },
    sharedKeyCredential
  ).toString();

  const sasUrl = `${blobClient.url}?${sasToken}`;

  context.res = {
    status: 200,
    body: {
      url: sasUrl,
      expiresOn: expiry.toISOString(),
    },
  };
};
