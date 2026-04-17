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
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', fontSize: 8, color: '#94a3b8', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 }
});

interface FinancialSummaryReportProps {
  stats: any;
  accounts: any[];
}

export const FinancialSummaryReport = ({ stats, accounts }: FinancialSummaryReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.companyName}>EYE ADOM</Text>
          <Text style={{ fontSize: 8, color: '#64748b' }}>SUSU & SAVINGS</Text>
        </View>
        <Text style={styles.reportTitle}>Financial Summary</Text>
      </View>

      {/* Summary Section */}
      <View style={{ marginBottom: 30, flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
        <View style={{ width: '45%', padding: 15, backgroundColor: '#f0fdf4', borderRadius: 8 }}>
          <Text style={{ fontSize: 9, color: '#047857', fontWeight: 'bold', marginBottom: 5 }}>Total Deposits</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#064e3b' }}>GHS {parseFloat(stats?.totalDeposits || 0).toFixed(2)}</Text>
        </View>
        <View style={{ width: '45%', padding: 15, backgroundColor: '#fff1f2', borderRadius: 8 }}>
          <Text style={{ fontSize: 9, color: '#e11d48', fontWeight: 'bold', marginBottom: 5 }}>Total Withdrawals</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#881337' }}>GHS {parseFloat(stats?.totalWithdrawals || 0).toFixed(2)}</Text>
        </View>
        <View style={{ width: '45%', padding: 15, backgroundColor: '#eff6ff', borderRadius: 8 }}>
          <Text style={{ fontSize: 9, color: '#1d4ed8', fontWeight: 'bold', marginBottom: 5 }}>Global Balance Focus</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1e3a8a' }}>GHS {parseFloat(stats?.globalSystemBalance || 0).toFixed(2)}</Text>
        </View>
      </View>

      <Text style={[styles.reportTitle, { marginBottom: 10 }]}>Top Account Holders</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { flex: 0.5 }]}>
            <Text style={styles.tableHeaderCell}>Rank</Text>
          </View>
          <View style={[styles.tableCol, { flex: 1.5 }]}>
            <Text style={styles.tableHeaderCell}>Account Number</Text>
          </View>
          <View style={[styles.tableCol, { flex: 2 }]}>
            <Text style={styles.tableHeaderCell}>Member Name</Text>
          </View>
          <View style={[styles.tableCol, { flex: 1.5 }]}>
            <Text style={styles.tableHeaderCell}>Balance</Text>
          </View>
        </View>

        {accounts.map((acc, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={[styles.tableCol, { flex: 0.5 }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>#{index + 1}</Text>
            </View>
            <View style={[styles.tableCol, { flex: 1.5 }]}>
              <Text style={styles.tableCell}>{acc.account_number}</Text>
            </View>
            <View style={[styles.tableCol, { flex: 2 }]}>
              <Text style={styles.tableCell}>{acc.first_name} {acc.surname}</Text>
            </View>
            <View style={[styles.tableCol, { flex: 1.5 }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>GHS {parseFloat(acc.balance || 0).toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Official Financial Report | Generated {new Date().toLocaleString()}
      </Text>
    </Page>
  </Document>
);
