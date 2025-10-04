import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { Readable } from 'stream';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const fileName = decodeURIComponent(params.fileId);

  if (!fileName) {
    return new NextResponse('File name is required', { status: 400 });
  }

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    console.error("GOOGLE_DRIVE_FOLDER_ID is not set");
    return new NextResponse('Server configuration error', { status: 500 });
  }

  try {
    const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const listResponse = await drive.files.list({
      q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id)',
      spaces: 'drive',
    });

    if (!listResponse.data.files || listResponse.data.files.length === 0) {
      return new NextResponse(`File not found in Drive: ${fileName}`, { status: 404 });
    }

    const fileId = listResponse.data.files[0].id;
    if (!fileId) {
        return new NextResponse(`File ID not found for: ${fileName}`, { status: 404 });
    }

    const fileResponse = await drive.files.get(
      { fileId: fileId, alt: 'media' },
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

  } catch (error) {
    console.error('Error fetching image from Google Drive:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
