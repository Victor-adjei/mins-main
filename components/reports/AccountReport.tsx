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
  statusActive: { color: '#10b981' },
  statusInactive: { color: '#ef4444' },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', fontSize: 8, color: '#94a3b8', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 }
});

interface AccountReportProps {
  accounts: any[];
}

export const AccountReport = ({ accounts }: AccountReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.companyName}>EYE ADOM</Text>
          <Text style={{ fontSize: 8, color: '#64748b' }}>SUSU & SAVINGS</Text>
        </View>
        <Text style={styles.reportTitle}>Accounts Database</Text>
      </View>

      <Text style={styles.dateRange}>Total Accounts: {accounts.length}</Text>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { flex: 1 }]}>
            <Text style={styles.tableHeaderCell}>Account No</Text>
          </View>
          <View style={[styles.tableCol, { flex: 2 }]}>
            <Text style={styles.tableHeaderCell}>Customer Name</Text>
          </View>
          <View style={[styles.tableCol, { flex: 1.5 }]}>
            <Text style={styles.tableHeaderCell}>Account Type</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableHeaderCell}>Balance</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableHeaderCell}>Date Opened</Text>
          </View>
        </View>

        {accounts.map((a, idx) => (
          <View key={idx} style={styles.tableRow}>
            <View style={[styles.tableCol, { flex: 1 }]}>
              <Text style={styles.tableCell}>{a.account_number}</Text>
            </View>
            <View style={[styles.tableCol, { flex: 2 }]}>
              <Text style={styles.tableCell}>{a.first_name} {a.surname}</Text>
              <Text style={{ fontSize: 7, color: '#64748b' }}>{a.customer_type_name || 'Standard'}</Text>
            </View>
            <View style={[styles.tableCol, { flex: 1.5 }]}>
              <Text style={styles.tableCell}>{a.account_type_name}</Text>
              <Text style={[
                { fontSize: 7 },
                a.account_status_name === 'Active' ? styles.statusActive : styles.statusInactive
              ]}>{a.account_status_name}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>GHS {parseFloat(a.balance).toFixed(2)}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{new Date(a.created_at).toLocaleDateString()}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Official Accounts Report | Generated {new Date().toLocaleString()}
      </Text>
    </Page>
  </Document>
);
