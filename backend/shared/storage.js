const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");

function getTableClient() {
  const connectionString = process.env.AzureWebJobsStorage; // <--- FIXED HERE
  const tableName = process.env.AZURE_TABLE_NAME;

  if (!connectionString) {
    throw new Error("AzureWebJobsStorage is not set.");
  }

  // Parse account name and key for credential
  const parsed = /AccountName=([^;]+);AccountKey=([^;]+)/.exec(
    connectionString
  );
  if (!parsed) throw new Error("Could not parse storage connection string.");

  const accountName = parsed[1];
  const accountKey = parsed[2];

  const credential = new AzureNamedKeyCredential(accountName, accountKey);

  return new TableClient(
    `https://${accountName}.table.core.windows.net`,
    tableName,
    credential
  );
}

async function insertMetadata(userId, filename, size) {
  const client = getTableClient();
  const entity = {
    partitionKey: userId,
    rowKey: filename,
    uploadedOn: new Date().toISOString(),
    size: size,
  };
  await client.upsertEntity(entity);
}

async function listMetadata(userId) {
  const client = getTableClient();
  const entities = client.listEntities({
    queryOptions: { filter: `PartitionKey eq '${userId}'` },
  });

  const results = [];
  for await (const entity of entities) {
    results.push({
      filename: entity.rowKey,
      uploadedOn: entity.uploadedOn,
      size: entity.size,
    });
  }
  return results;
}

async function deleteMetadata(userId, filename) {
  const client = getTableClient();
  await client.deleteEntity(userId, filename);
}

module.exports = {
  insertMetadata,
  listMetadata,
  deleteMetadata,
};
