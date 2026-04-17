import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { renderToBuffer } from '@react-pdf/renderer';
import { AccountReport } from '@/components/reports/AccountReport';
import React from 'react';

export const GET = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const res = await query(`
      SELECT a.*, c.first_name, c.surname, ct.customer_type_name, att.account_type_name, ast.account_status_name
      FROM accounts a
      JOIN customers c ON a.customer = c.customer_number
      LEFT JOIN customer_type ct ON c.customer_type::VARCHAR = ct.customer_type_number::VARCHAR
      LEFT JOIN account_types att ON a.account_type::VARCHAR = att.account_type_number::VARCHAR
      LEFT JOIN account_status ast ON a.account_status::VARCHAR = ast.account_status_number::VARCHAR
      ORDER BY a.created_at DESC
    `);
    const accounts = res.rows;

    const buffer = await renderToBuffer(<AccountReport accounts={accounts} />);

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename=accounts_report.pdf',
      },
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
});
