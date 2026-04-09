import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { renderToBuffer } from '@react-pdf/renderer';
import { CustomerReport } from '@/components/reports/CustomerReport';
import React from 'react';

export const GET = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const res = await query(`
      SELECT c.*, ct.customer_type_name
      FROM customers c
      LEFT JOIN customers_type ct ON c.customer_number = ct.customer_type_number
      ORDER BY c.registration_date DESC
    `);
    const customers = res.rows;

    const buffer = await renderToBuffer(<CustomerReport customers={customers} />);

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename=customers_report.pdf',
      },
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
});
