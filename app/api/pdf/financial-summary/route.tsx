import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { renderToBuffer } from '@react-pdf/renderer';
import { FinancialSummaryReport } from '@/components/reports/FinancialSummaryReport';
import React from 'react';

export const GET = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [statsResult, accountsResult] = await Promise.all([
      query(`
        SELECT 
          (SELECT SUM(amount) FROM transactions WHERE transaction_type = 'Deposit' AND voided = false) as total_deposits,
          (SELECT SUM(amount) FROM transactions WHERE transaction_type = 'Withdrawal' AND voided = false) as total_withdrawals,
          (SELECT SUM(balance) FROM accounts) as global_system_balance
      `),
      query(`
        SELECT a.account_number, c.first_name, c.surname, a.balance 
        FROM accounts a 
        JOIN customers c ON a.customer = c.customer_number 
        ORDER BY a.balance DESC
      `)
    ]);

    const s = statsResult.rows[0];
    const stats = {
      totalDeposits: parseFloat(s.total_deposits || 0),
      totalWithdrawals: parseFloat(s.total_withdrawals || 0),
      globalSystemBalance: parseFloat(s.global_system_balance || 0),
    };
    const accounts = accountsResult.rows;

    const buffer = await renderToBuffer(<FinancialSummaryReport stats={stats} accounts={accounts} />);

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename=financial_summary_report.pdf',
      },
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
});
