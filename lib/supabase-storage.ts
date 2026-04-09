export async function uploadToSupabase(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string | null> {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
  const bucket = 'passports';
  const path = `photos/${fileName}`;

  const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: new Uint8Array(fileBuffer),
  });

  if (!res.ok) return null;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
