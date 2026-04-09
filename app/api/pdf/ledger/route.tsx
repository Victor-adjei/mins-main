import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { renderToBuffer } from '@react-pdf/renderer';
import { TransactionLedgerReport } from '@/components/reports/TransactionLedgerReport';
import React from 'react';

export const GET = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0];
  const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0];

  try {
    const res = await query(`
      SELECT t.*, c.first_name, c.surname
      FROM transactions t
      JOIN accounts a ON t.account_number = a.account_number
      JOIN customers c ON a.customer = c.customer_number
      WHERE CAST(t.transaction_date AS DATE) BETWEEN $1 AND $2
      ORDER BY t.transaction_date DESC
    `, [startDate, endDate]);
    
    const transactions = res.rows;

    const buffer = await renderToBuffer(
      <TransactionLedgerReport 
        transactions={transactions} 
        startDate={startDate} 
        endDate={endDate} 
      />
    );

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=ledger_${startDate}_to_${endDate}.pdf`,
      },
    });
  } catch (error) {
    console.error('Ledger PDF Error:', error);
    return NextResponse.json({ error: 'Failed to generate Ledger PDF' }, { status: 500 });
  }
});
