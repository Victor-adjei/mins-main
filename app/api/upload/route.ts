import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadToSupabase } from '@/lib/supabase-storage';

export const POST = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit. Please choose a smaller image.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Sanitize filename for Supabase storage
    const rawName = file.name || 'photo.jpg';
    const cleanName = rawName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}-${cleanName}`;
    const contentType = file.type || 'image/jpeg';

    const publicUrl = await uploadToSupabase(buffer, fileName, contentType);

    if (!publicUrl) {
      return NextResponse.json({ error: 'Failed to upload photo to Supabase Storage' }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error during upload' }, { status: 500 });
  }
});
