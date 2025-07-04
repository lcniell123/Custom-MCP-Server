# MCP Filesystem Assistant – Azure Functions Backend

This project is an AI-powered file assistant with an Azure serverless backend.  
It supports secure per-user storage and retrieval of files, ready for integration with a React frontend.

---

## Features

✅ Upload files to Azure Blob Storage  
✅ List files stored for each user  
✅ Download files via secure SAS URLs  
✅ Delete files and metadata  
✅ Per-user data isolation (`userId` folders and PartitionKeys)  
✅ Fallback `testuser` mode for local/Postman testing  
✅ Ready for React frontend with MSAL authentication

---

## Project Structure

```
backend/
├── Upload/
│   └── index.js         # Upload file endpoint
├── Download/
│   └── index.js         # Generate SAS URL
├── Delete/
│   └── index.js         # Delete file and metadata
├── List/
│   └── index.js         # List metadata
├── shared/
│   ├── auth.js          # Parses user claims (oid/sub)
│   └── storage.js       # Table Storage helpers
```

---

## Prerequisites

- Node.js v18+
- Azure Subscription
- Azure Function App deployed with:
  - Blob Storage container (`userfiles`)
  - Table Storage table (`FileMetadata`)
- App Registration in Azure AD (for authentication)

---

## Installation & Deployment

1. Clone this repo.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create the following Application Settings in Azure:

   - `AzureWebJobsStorage`
   - `AZURE_BLOB_CONTAINER_NAME`
   - `AZURE_TABLE_NAME`

4. Deploy to Azure Functions (e.g., using VS Code Azure Functions extension).

---

## Testing with Postman

✅ All endpoints can be tested without authentication using fallback `testuser` mode:

```
POST   /api/Upload
GET    /api/List
GET    /api/Download?filename=<name>
GET    /api/Delete?filename=<name>
```

**Fallback Logic:**
If no valid claims are detected:

```
const userId = "testuser";
```

This allows you to test without needing tokens.

---

## How It Works

- Files are stored in:
  ```
  userfiles/<userId>/<filename>
  ```
- Metadata stored in Table Storage with:
  ```
  PartitionKey = <userId>
  RowKey = <filename>
  ```
- When your frontend is ready and you authenticate users via Azure AD:
  - The `getUserFromHeaders()` function will parse `x-ms-client-principal`.
  - Files will be isolated per user automatically.

---

## Next Steps

✅ Build React frontend (Phase 1.6)

- Add MSAL.js login flow
- Display per-user file lists
- Integrate Upload/Download/Delete UI

✅ Re-enable authentication in Azure Portal before production:

- Turn "Require Authentication" back on
- Remove fallback `testuser` logic if desired

✅ Add Application Insights for monitoring

---

## License

MIT License
