# AWS S3 Profile Images for Swifter

This guide explains how to store user profile images in AWS S3 and connect Swifter to that bucket.

## 1. Create an AWS account

1. Go to https://aws.amazon.com and sign up for a free account.
2. Complete identity verification and choose a support plan.
3. Sign in to the AWS Management Console.

## 2. Create an S3 bucket

1. Open the S3 service from the AWS Console.
2. Click **Create bucket**.
3. Enter a unique bucket name, for example `swifter-user-avatars-12345`.
4. Choose an AWS Region close to your users, for example `us-east-1`.
5. Disable **Block all public access** only if you want direct browser access to uploaded images.
   - If you disable public access, you must also add a bucket policy or object ACL that allows `s3:GetObject` for `arn:aws:s3:::your-bucket-name/*`.
6. Click **Create bucket**.

## 3. Create AWS IAM credentials

1. Open IAM from the AWS Console.
2. Go to **Users** and click **Add users**.
3. Set a username such as `swifter-s3-uploader`.
4. Select **Programmatic access**.
5. Attach existing policies directly.
   - Choose the AWS managed policy **AmazonS3FullAccess** for a simple setup.
   - For production, prefer a least-privilege policy scoped to the bucket only.
6. Complete creation and copy the **Access key ID** and **Secret access key**.

## 4. Add AWS values to backend environment

Open `backend/.env` or create it from `backend/.env.example`, then add:

```env
AWS_S3_BUCKET=your-s3-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
```

If you do not already have a `backend/.env` file:

```bash
cd backend
cp .env.example .env
```

Then update the AWS values.

## 5. How Swifter uses AWS S3

- The backend route `POST /api/users/:id/avatar` uploads a file to S3.
- The file is stored under the `avatars/` prefix in the bucket.
- The user document stores `profileImageUrl` pointing to the uploaded image.
- The frontend displays user avatars in:
  - `Users` management list
  - `Dashboard` recent users list
  - `Profile` page

## 6. Make images readable from browser

If your bucket blocks public access, direct URLs may not load. For a simple admin portal setup, use one of these options:

### Option A: Public access via bucket policy (recommended for simple apps)

1. In the S3 bucket settings, choose **Permissions**.
2. Open **Bucket policy** and add a policy like:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-s3-bucket-name/*"
    }
  ]
}
```

3. Save the policy.

### Option B: Keep the bucket private and use signed URLs

This requires extra backend work and is not part of the current Swifter implementation.

## 7. Uploading images from the app

1. Login as any user.
2. Open the **Profile** page from the sidebar.
3. Choose an image file.
4. Click **Upload Image**.
5. The image appears in your profile and user lists.

## 8. Testing the connection

1. Start the backend server:

```bash
cd backend
npm install
npm run dev
```

2. Start the frontend server:

```bash
cd frontend
npm install
npm run dev
```

3. Login and upload a profile image.
4. Confirm the image appears in the UI and the returned URL points to your S3 bucket.

## 9. Notes

- Allowed file types: PNG, JPG, JPEG, GIF.
- Maximum file size: 5 MB.
- If images do not display, verify your S3 bucket policy and public access settings.
