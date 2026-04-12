import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

export const GET = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [stats, accounts] = await Promise.all([
      query(`
        SELECT 
          (SELECT COUNT(*) FROM customers) as total_customers,
          (SELECT COUNT(*) FROM accounts) as total_accounts,
          (SELECT SUM(amount) FROM transactions WHERE transaction_type = 'Deposit' AND voided = false) as total_deposits,
          (SELECT SUM(amount) FROM transactions WHERE transaction_type = 'Withdrawal' AND voided = false) as total_withdrawals,
          (SELECT SUM(loan_amount) FROM loans) as total_loans
      `),
      query(`
        SELECT a.account_number, c.first_name, c.surname, a.balance 
        FROM accounts a 
        JOIN customers c ON a.customer = c.customer_number 
        ORDER BY a.balance DESC
      `)
    ]);

    const s = stats.rows[0];

    return NextResponse.json({
      summary: {
        totalCustomers: parseInt(s.total_customers || 0),
        totalAccounts: parseInt(s.total_accounts || 0),
        totalDeposits: parseFloat(s.total_deposits || 0),
        totalWithdrawals: parseFloat(s.total_withdrawals || 0),
        totalLoans: parseFloat(s.total_loans || 0),
      },
      accounts: accounts.rows
    });
  } catch (error) {
    console.error('Financial Summary API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
