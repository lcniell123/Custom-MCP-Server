const {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");

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

  // TEMP: hardcode userId (replace with auth later)
  const userId = "testuser";
  const blobName = `${userId}/${req.query.filename}`;
  const blobClient = containerClient.getBlobClient(blobName);

  // Generate a SAS URL (valid for 10 minutes)
  const expiry = new Date(new Date().valueOf() + 10 * 60 * 1000);

  // You need the account name and key separately to generate SAS
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
