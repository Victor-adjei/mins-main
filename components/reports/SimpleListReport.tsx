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

interface SimpleListReportProps {
  title: string;
  items: { id: string | number; name: string }[];
}

export const SimpleListReport = ({ title, items }: SimpleListReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.companyName}>EYE ADOM</Text>
          <Text style={{ fontSize: 8, color: '#64748b' }}>SUSU & SAVINGS</Text>
        </View>
        <Text style={styles.reportTitle}>{title}</Text>
      </View>

      <Text style={styles.dateRange}>Total Records: {items.length}</Text>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { flex: 1 }]}>
            <Text style={styles.tableHeaderCell}>ID</Text>
          </View>
          <View style={[styles.tableCol, { flex: 4 }]}>
            <Text style={styles.tableHeaderCell}>Name</Text>
          </View>
        </View>

        {items.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <View style={[styles.tableCol, { flex: 1 }]}>
              <Text style={styles.tableCell}>{item.id}</Text>
            </View>
            <View style={[styles.tableCol, { flex: 4 }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{item.name}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Official System Report | Generated {new Date().toLocaleString()}
      </Text>
    </Page>
  </Document>
);
