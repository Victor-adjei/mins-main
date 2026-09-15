import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

export const GET = auth(async (req) => {
  if (!req.auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let dateFilterCustomer = '';
    let dateFilterAccount = '';
    let dateFilterTransaction = '';
    let dateFilterLoan = '';
    const queryParams: any[] = [];

    if (startDate && endDate) {
      dateFilterCustomer = 'WHERE CAST(registration_date AS DATE) BETWEEN $1 AND $2';
      dateFilterAccount = 'WHERE CAST(created_at AS DATE) BETWEEN $1 AND $2';
      dateFilterTransaction = 'AND CAST(transaction_date AS DATE) BETWEEN $1 AND $2';
      dateFilterLoan = 'WHERE CAST(application_date AS DATE) BETWEEN $1 AND $2';
      queryParams.push(startDate, endDate);
    }

    const [stats, accounts] = await Promise.all([
      query(`
        SELECT 
          (SELECT COUNT(*) FROM customers ${dateFilterCustomer}) as total_customers,
          (SELECT COUNT(*) FROM accounts ${dateFilterAccount}) as total_accounts,
          (SELECT SUM(amount) FROM transactions WHERE transaction_type = 'Deposit' AND voided = false ${dateFilterTransaction}) as total_deposits,
          (SELECT SUM(amount) FROM transactions WHERE transaction_type = 'Withdrawal' AND voided = false ${dateFilterTransaction}) as total_withdrawals,
          (SELECT SUM(loan_amount) FROM loans ${dateFilterLoan}) as total_loans
      `, queryParams.length > 0 ? queryParams : undefined),
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
