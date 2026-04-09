import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 20
  },
  companyName: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  reportTitle: { fontSize: 10, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' },
  dateRange: { fontSize: 9, color: '#64748b', marginBottom: 20 },
  table: { display: 'flex', width: 'auto', marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottomColor: '#f1f5f9', borderBottomWidth: 1, minHeight: 40, alignItems: 'center' },
  tableHeader: { backgroundColor: '#f8fafc', borderBottomColor: '#e2e8f0', borderBottomWidth: 2 },
  tableCol: { flex: 1, padding: 5 },
  tableCell: { fontSize: 9, color: '#334155' },
  tableHeaderCell: { fontSize: 8, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' },
  amount: { fontWeight: 'bold' },
  deposit: { color: '#10b981' },
  withdrawal: { color: '#ef4444' },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', fontSize: 8, color: '#94a3b8', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 }
});

interface LedgerProps {
  transactions: any[];
  startDate: string;
  endDate: string;
}

export const TransactionLedgerReport = ({ transactions, startDate, endDate }: LedgerProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.companyName}>EYE ADOM</Text>
          <Text style={{ fontSize: 8, color: '#64748b' }}>SUSU & SAVINGS</Text>
        </View>
        <Text style={styles.reportTitle}>Transaction Ledger</Text>
      </View>

      <Text style={styles.dateRange}>Period: {startDate} to {endDate}</Text>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { flex: 1.2 }]}>
            <Text style={styles.tableHeaderCell}>Date</Text>
          </View>
          <View style={[styles.tableCol, { flex: 2 }]}>
            <Text style={styles.tableHeaderCell}>Member / Account</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableHeaderCell}>Type</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableHeaderCell}>Amount</Text>
          </View>
        </View>

        {transactions.map((t) => (
          <View key={t.transaction_id} style={styles.tableRow}>
            <View style={[styles.tableCol, { flex: 1.2 }]}>
              <Text style={styles.tableCell}>{new Date(t.transaction_date).toLocaleString()}</Text>
            </View>
            <View style={[styles.tableCol, { flex: 2 }]}>
              <Text style={styles.tableCell}>{t.first_name} {t.surname}</Text>
              <Text style={{ fontSize: 7, color: '#64748b' }}>Acc #{t.account_number}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={[styles.tableCell, t.transaction_type === 'Deposit' ? styles.deposit : styles.withdrawal]}>
                {t.transaction_type}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={[styles.tableCell, styles.amount]}>
                {t.transaction_type === 'Deposit' ? '+' : '-'} GHS {parseFloat(t.amount).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Official Transaction Report | Generated {new Date().toLocaleString()}
      </Text>
    </Page>
  </Document>
);
