export async function uploadToSupabase(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string | null> {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
  const bucket = 'passports';
  const path = `photos/${fileName}`;

  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': contentType || 'image/jpeg',
        'x-upsert': 'true',
      },
      body: new Uint8Array(fileBuffer),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`Supabase Storage Upload Error [status ${res.status}]:`, errText);
      return null;
    }
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
  } catch (error) {
    console.error('Supabase Storage Network Error:', error);
    return null;
  }
}
