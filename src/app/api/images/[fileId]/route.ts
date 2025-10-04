import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { Readable } from 'stream';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const param = decodeURIComponent(params.fileId);

  if (!param) {
    return new NextResponse('File identifier is required', { status: 400 });
  }

  try {
    const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    let fileIdToFetch: string | null = null;

    // Heuristic to check if the param is a File ID or a filename.
    // Google Drive File IDs are typically alphanumeric (with - and _) and longer than 20 chars.
    const isFileId = /^[a-zA-Z0-9_-]{20,}$/.test(param);

    if (isFileId) {
      fileIdToFetch = param;
    } else {
      // It's a filename, so search for it in the specified folder.
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      if (!folderId) {
        console.error("GOOGLE_DRIVE_FOLDER_ID is not set");
        return new NextResponse('Server configuration error: Missing folder ID', { status: 500 });
      }
      
      const listResponse = await drive.files.list({
        q: `name='${param}' and '${folderId}' in parents and trashed=false`,
        fields: 'files(id)',
        spaces: 'drive',
      });

      if (listResponse.data.files && listResponse.data.files.length > 0) {
        fileIdToFetch = listResponse.data.files[0].id ?? null;
      }
    }

    if (!fileIdToFetch) {
      return new NextResponse(`File not found for identifier: ${param}`, { status: 404 });
    }

    const fileResponse = await drive.files.get(
      { fileId: fileIdToFetch, alt: 'media' },
      { responseType: 'stream' }
    );

    const headers = new Headers();
    headers.set('Content-Type', fileResponse.headers['content-type'] || 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    const readableStream = new Readable().wrap(fileResponse.data);

    return new NextResponse(readableStream as any, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    // If the error is a 404 from Google API, it's a file not found error.
    if (error.code === 404) {
      return new NextResponse(`File not found in Drive for identifier: ${param}`, { status: 404 });
    }
    console.error('Error fetching image from Google Drive:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
