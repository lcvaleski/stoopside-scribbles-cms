# Google Cloud Storage Setup Guide

## Prerequisites

1. A Google Cloud Project (same one used for OAuth)
2. Google Cloud Storage bucket created
3. Service account with Storage Admin permissions (for local development)

## Setup Steps

### 1. Create a GCS Bucket

```bash
# Using gcloud CLI
gcloud storage buckets create gs://YOUR-BUCKET-NAME --location=us-central1
```

Or create via [Google Cloud Console](https://console.cloud.google.com/storage)

### 2. Set Bucket Permissions

Make the bucket public for reading images (optional, for public blog images):

```bash
gcloud storage buckets add-iam-policy-binding gs://YOUR-BUCKET-NAME \
  --member=allUsers \
  --role=roles/storage.objectViewer
```

### 3. Service Account Setup (for local development)

```bash
# Create service account
gcloud iam service-accounts create cms-storage \
  --display-name="CMS Storage Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
  --member="serviceAccount:cms-storage@YOUR-PROJECT-ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Create and download key
gcloud iam service-accounts keys create ~/cms-storage-key.json \
  --iam-account=cms-storage@YOUR-PROJECT-ID.iam.gserviceaccount.com
```

### 4. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=your-bucket-name

# For local development only
GOOGLE_APPLICATION_CREDENTIALS=/path/to/cms-storage-key.json

# Your existing OAuth config
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=xxx
AUTHORIZED_EMAILS=email1@gmail.com,email2@gmail.com
```

### 5. Production Deployment (Vercel)

Add environment variables in Vercel dashboard:
- `GOOGLE_CLOUD_PROJECT_ID`
- `GCS_BUCKET_NAME`
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` (paste the entire service account JSON as a string)

Then update your `lib/gcs.ts` to handle the JSON credentials:

```typescript
// In production, parse credentials from env variable
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  storage = new Storage({
    projectId,
    credentials,
  });
}
```

## Storage Structure

The CMS uses the following structure in your GCS bucket:

```
your-bucket/
├── blog-data/
│   └── posts.json          # Blog posts database
└── blog-images/
    ├── image1.jpg          # Uploaded images
    └── image2.png
```

## Verifying Setup

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/dashboard` and sign in

3. Try creating a blog post with an image upload

4. Check your GCS bucket to verify:
   - Images appear in `blog-images/` folder
   - `blog-data/posts.json` is created

## Troubleshooting

### "GOOGLE_CLOUD_PROJECT_ID environment variable is required"
- Ensure `.env.local` file exists with the correct project ID

### "GCS_BUCKET_NAME environment variable is required"
- Add your bucket name to `.env.local`

### Permission Denied errors
- Verify service account has Storage Admin role
- Check GOOGLE_APPLICATION_CREDENTIALS path is correct
- For production, ensure the service account JSON is properly set

### CORS Issues (if accessing images directly)
If you need CORS support for direct image access:

```bash
# Create cors.json
echo '[
  {
    "origin": ["*"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]' > cors.json

# Apply to bucket
gcloud storage buckets update gs://YOUR-BUCKET-NAME --cors-file=cors.json
```