import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { renderToBuffer } from '@react-pdf/renderer';
import { SimpleListReport } from '@/components/reports/SimpleListReport';
import React from 'react';

export const GET = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const res = await query('SELECT * FROM customer_type ORDER BY customer_type_number ASC');
    const items = res.rows.map(row => ({
      id: row.customer_type_number,
      name: row.customer_type_name
    }));

    const buffer = await renderToBuffer(<SimpleListReport title="Customer Types" items={items} />);

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename=customer_types_report.pdf',
      },
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
});
