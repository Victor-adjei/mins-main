import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { auth } from '@/auth';

export const GET = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [custTypes, accTypes, customers, accounts] = await Promise.all([
      query('SELECT COUNT(*) FROM customers_type'),
      query('SELECT COUNT(*) FROM account_type'),
      query('SELECT COUNT(*) FROM customers'),
      query('SELECT COUNT(*) FROM accounts'),
    ]);

    return NextResponse.json({
      customerTypes: parseInt(custTypes.rows[0].count),
      accountTypes: parseInt(accTypes.rows[0].count),
      totalCustomers: parseInt(customers.rows[0].count),
      totalAccounts: parseInt(accounts.rows[0].count),
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
