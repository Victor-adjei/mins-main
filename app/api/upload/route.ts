import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const POST = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate size limit (max 10MB input before compression)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit. Please choose a smaller image.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || 'image/jpeg';
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    return NextResponse.json({ url: dataUrl });
  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error during upload' }, { status: 500 });
  }
});
