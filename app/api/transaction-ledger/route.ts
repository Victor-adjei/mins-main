import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

export const GET = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0];
  const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0];

  try {
    const isFieldOfficer = req.auth.user.role === 'Field Officer';
    const queryParams: any[] = [startDate, endDate];
    let sql = `
      SELECT t.*, c.first_name, c.surname
      FROM transactions t
      JOIN accounts a ON t.account_number = a.account_number
      JOIN customers c ON a.customer = c.customer_number
      WHERE t.transaction_date::DATE BETWEEN $1 AND $2
    `;

    if (isFieldOfficer) {
      sql += ` AND c.mobile_banker = $3`;
      queryParams.push(req.auth.user.name);
    }

    sql += ` ORDER BY t.transaction_date DESC`;

    const res = await query(sql, queryParams);

    const transactions = res.rows;

    // Calculate Summary Stats
    const totalDeposits = transactions
      .filter((t: any) => t.transaction_type === 'Deposit')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);
    
    const totalWithdrawals = transactions
      .filter((t: any) => t.transaction_type === 'Withdrawal')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);

    // Group by Day for Chart
    const chartMap = new Map();
    transactions.forEach((t: any) => {
      const date = new Date(t.transaction_date).toISOString().split('T')[0];
      if (!chartMap.has(date)) {
        chartMap.set(date, { date, deposits: 0, withdrawals: 0 });
      }
      const entry = chartMap.get(date);
      if (t.transaction_type === 'Deposit') entry.deposits += parseFloat(t.amount || 0);
      else entry.withdrawals += parseFloat(t.amount || 0);
    });

    const chartData = Array.from(chartMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    
    return NextResponse.json({
      transactions,
      summary: {
        totalDeposits,
        totalWithdrawals,
        netCashFlow: totalDeposits - totalWithdrawals
      },
      chartData
    });
  } catch (error) {
    console.error('Ledger API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
