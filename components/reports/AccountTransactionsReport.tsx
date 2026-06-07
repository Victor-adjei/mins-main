import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 15
  },
  companyName: { fontSize: 18, fontWeight: 'bold', color: '#0066cc' },
  reportTitle: { fontSize: 10, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  accountSummary: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  summaryField: {
    width: '45%',
    marginBottom: 6
  },
  summaryLabel: { fontSize: 7, color: '#64748b', textTransform: 'uppercase', marginBottom: 2, fontWeight: 'bold' },
  summaryValue: { fontSize: 10, color: '#0f172a', fontWeight: 'bold' },
  table: { display: 'flex', width: 'auto', marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottomColor: '#f1f5f9', borderBottomWidth: 1, minHeight: 32, alignItems: 'center' },
  tableHeader: { backgroundColor: '#0f172a', borderBottomColor: '#1e293b', borderBottomWidth: 2 },
  tableCol: { flex: 1, padding: 4 },
  tableCell: { fontSize: 8, color: '#334155' },
  tableHeaderCell: { fontSize: 8, fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase' },
  amount: { fontWeight: 'bold' },
  deposit: { color: '#10b981' },
  withdrawal: { color: '#ef4444' },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 7,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8
  }
});

interface Transaction {
  transaction_id: number;
  transaction_date: string;
  transaction_type: 'Deposit' | 'Withdrawal';
  amount: string | number;
  running_balance: string | number;
  description: string;
  performed_by: string;
}

interface Account {
  account_number: string;
  first_name: string;
  surname: string;
  balance: string | number;
  account_rank: string | number;
}

interface ReportProps {
  account: Account;
  transactions: Transaction[];
}

export const AccountTransactionsReport = ({ account, transactions }: ReportProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>EYE ADOM</Text>
            <Text style={{ fontSize: 8, color: '#64748b', fontWeight: 'bold' }}>SUSU & SAVINGS</Text>
          </View>
          <Text style={styles.reportTitle}>Account Statement</Text>
        </View>

        {/* Account Summary Cards */}
        <View style={styles.accountSummary}>
          <View style={styles.summaryField}>
            <Text style={styles.summaryLabel}>Account Holder</Text>
            <Text style={styles.summaryValue}>{account.first_name} {account.surname}</Text>
          </View>
          <View style={styles.summaryField}>
            <Text style={styles.summaryLabel}>Account Number</Text>
            <Text style={styles.summaryValue}>#{account.account_number}</Text>
          </View>
          <View style={styles.summaryField}>
            <Text style={styles.summaryLabel}>Current Balance</Text>
            <Text style={[styles.summaryValue, { color: '#0066cc' }]}>
              GHS {parseFloat(account.balance.toString()).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.summaryField}>
            <Text style={styles.summaryLabel}>A/C Rank</Text>
            <Text style={styles.summaryValue}>Rank {account.account_rank}</Text>
          </View>
        </View>

        {/* Transaction History Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCol, { flex: 1.3 }]}>
              <Text style={styles.tableHeaderCell}>Date & Time</Text>
            </View>
            <View style={[styles.tableCol, { flex: 0.8 }]}>
              <Text style={styles.tableHeaderCell}>Type</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableHeaderCell}>Amount</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableHeaderCell}>Balance</Text>
            </View>
            <View style={[styles.tableCol, { flex: 1.8 }]}>
              <Text style={styles.tableHeaderCell}>Description / Remarks</Text>
            </View>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { flex: 5, alignItems: 'center', padding: 15 }]}>
                <Text style={[styles.tableCell, { color: '#94a3b8', fontStyle: 'italic' }]}>
                  No transactions found for this account.
                </Text>
              </View>
            </View>
          ) : (
            transactions.map((t) => (
              <View key={t.transaction_id} style={styles.tableRow}>
                <View style={[styles.tableCol, { flex: 1.3 }]}>
                  <Text style={styles.tableCell}>
                    {new Date(t.transaction_date).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 0.8 }]}>
                  <Text style={[styles.tableCell, t.transaction_type === 'Deposit' ? styles.deposit : styles.withdrawal]}>
                    {t.transaction_type}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={[styles.tableCell, styles.amount, t.transaction_type === 'Deposit' ? styles.deposit : styles.withdrawal]}>
                    {t.transaction_type === 'Deposit' ? '+' : '-'} {parseFloat(t.amount.toString()).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>
                    GHS {parseFloat(t.running_balance.toString()).toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 1.8 }]}>
                  <Text style={styles.tableCell}>{t.description || 'N/A'}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages} | Statement Generated on ${new Date().toLocaleString()} | Eye Adom Susu & Savings`
        )} fixed />
      </Page>
    </Document>
  );
};
