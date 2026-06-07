import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { renderToBuffer } from '@react-pdf/renderer';
import { AccountTransactionsReport } from '@/components/reports/AccountTransactionsReport';
import React from 'react';

export const GET = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const accountNumber = searchParams.get('accountNumber');

  if (!accountNumber) {
    return NextResponse.json({ error: 'Account number is required' }, { status: 400 });
  }

  try {
    // 1. Fetch account details
    const accountRes = await query(`
      SELECT a.*, c.first_name, c.surname
      FROM accounts a
      JOIN customers c ON a.customer = c.customer_number
      WHERE a.account_number = $1
    `, [accountNumber]);

    if (accountRes.rows.length === 0) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const account = accountRes.rows[0];

    // 2. Fetch transaction history with running balances
    const transactionsRes = await query(`
      SELECT 
        t.*, 
        (a.balance - COALESCE(
          SUM(CASE WHEN t.transaction_type = 'Deposit' THEN t.amount ELSE -t.amount END) 
            OVER (
              ORDER BY t.transaction_date DESC, t.transaction_id DESC 
              ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
            ), 0
        )) as running_balance
      FROM transactions t
      JOIN accounts a ON t.account_number = a.account_number
      WHERE t.account_number = $1 AND t.voided = false
      ORDER BY t.transaction_date DESC, t.transaction_id DESC
    `, [accountNumber]);

    const transactions = transactionsRes.rows;

    // 3. Render PDF
    const buffer = await renderToBuffer(
      <AccountTransactionsReport account={account} transactions={transactions} />
    );

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=statement_${accountNumber}.pdf`,
      },
    });
  } catch (error) {
    console.error('PDF Statement Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate statement PDF' }, { status: 500 });
  }
});
