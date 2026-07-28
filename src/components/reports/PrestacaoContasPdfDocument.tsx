"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatMoney, formatDate } from "@/lib/formatters";

// TASK-146 (EPIC-017): documento do Relatório de Prestação de Contas, gerado client-side via
// @react-pdf/renderer (RN-017-05 — decisão consciente de arquitetura pra v1, sem endpoint de PDF
// no backend). @react-pdf/renderer não usa DOM normal — por isso este componente é separado do
// preview em tela (PrestacaoContasSection), que usa HTML/CSS comuns.

export interface MaintenanceRow {
  id: number;
  itemType: string;
  performedAt: string;
  type: string;
  performedBy: string | null;
  costCents: number | null;
}

export interface CancelledRow {
  id: number;
  itemType: string;
  performedAt: string;
  cancelReason: string | null;
  cancelledByName: string | null;
  cancelledAt: string | null;
}

export interface PendingItemRow {
  id: number;
  itemType: string;
  itemCategory: string;
  nextDueAt: string | null;
  status: string;
  daysOverdue: number;
}

export interface PrestacaoContasData {
  organizationName: string;
  performedAtFrom: string;
  performedAtTo: string;
  totalMaintenances: number;
  totalCostCents: number;
  itemsOk: number;
  itemsNearDue: number;
  itemsOverdue: number;
  totalItems: number;
  maintenances: MaintenanceRow[];
  cancelled: CancelledRow[];
  pendingItems: PendingItemRow[];
}

const MAINT_TYPE_LABEL: Record<string, string> = {
  PREVENTIVA: "Preventiva",
  CORRETIVA: "Corretiva",
  INSPECAO: "Inspeção",
  TESTE: "Teste",
  EMERGENCIAL: "Emergencial",
};

const STATUS_LABEL: Record<string, string> = {
  OK: "Em dia",
  NEAR_DUE: "Próximo do vencimento",
  OVERDUE: "Vencido",
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, fontFamily: "Helvetica" },
  header: { marginBottom: 16, borderBottom: "1pt solid #d1d5db", paddingBottom: 10 },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#4b5563" },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#111827" },
  kpiRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  kpiCard: { flex: 1, border: "1pt solid #e5e7eb", borderRadius: 4, padding: 8 },
  kpiLabel: { fontSize: 7.5, color: "#6b7280", textTransform: "uppercase", marginBottom: 3 },
  kpiValue: { fontSize: 14, fontWeight: 700, color: "#111827" },
  table: { width: "100%" },
  tableHeaderRow: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: 4 },
  tableRow: { flexDirection: "row", padding: 4, borderBottom: "0.5pt solid #f1f5f9" },
  cell: { flex: 1 },
  cellHeader: { flex: 1, fontWeight: 700, fontSize: 8 },
  emptyText: { fontSize: 9, color: "#9ca3af", fontStyle: "italic" },
});

export default function PrestacaoContasPdfDocument({ data }: { data: PrestacaoContasData }) {
  const complianceRate = data.totalItems > 0
    ? Math.round(((data.totalItems - data.itemsOverdue) / data.totalItems) * 100)
    : 100;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Prestação de Contas</Text>
          <Text style={styles.subtitle}>{data.organizationName}</Text>
          <Text style={styles.subtitle}>
            Período: {formatDate(data.performedAtFrom)} a {formatDate(data.performedAtTo)}
          </Text>
          <Text style={styles.subtitle}>Gerado em {formatDate(new Date().toISOString())}</Text>
        </View>

        {/* Seção 1 — Resumo do período */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo do período</Text>
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Manutenções realizadas</Text>
              <Text style={styles.kpiValue}>{data.totalMaintenances}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Custo total</Text>
              <Text style={styles.kpiValue}>{formatMoney(data.totalCostCents)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Taxa de conformidade</Text>
              <Text style={styles.kpiValue}>{complianceRate}%</Text>
            </View>
          </View>
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Itens em dia</Text>
              <Text style={styles.kpiValue}>{data.itemsOk}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Próximos do vencimento</Text>
              <Text style={styles.kpiValue}>{data.itemsNearDue}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Vencidos</Text>
              <Text style={styles.kpiValue}>{data.itemsOverdue}</Text>
            </View>
          </View>
        </View>

        {/* Seção 2 — Manutenções realizadas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manutenções realizadas ({data.maintenances.length})</Text>
          {data.maintenances.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma manutenção realizada neste período.</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.cellHeader}>Data</Text>
                <Text style={styles.cellHeader}>Item</Text>
                <Text style={styles.cellHeader}>Tipo</Text>
                <Text style={styles.cellHeader}>Responsável</Text>
                <Text style={styles.cellHeader}>Custo</Text>
              </View>
              {data.maintenances.map((m) => (
                <View key={m.id} style={styles.tableRow}>
                  <Text style={styles.cell}>{formatDate(m.performedAt)}</Text>
                  <Text style={styles.cell}>{m.itemType}</Text>
                  <Text style={styles.cell}>{MAINT_TYPE_LABEL[m.type] ?? m.type}</Text>
                  <Text style={styles.cell}>{m.performedBy || "—"}</Text>
                  <Text style={styles.cell}>{m.costCents ? formatMoney(m.costCents) : "—"}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Seção 3 — Canceladas (auditoria) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manutenções canceladas — auditoria ({data.cancelled.length})</Text>
          {data.cancelled.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma manutenção cancelada neste período.</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.cellHeader}>Data original</Text>
                <Text style={styles.cellHeader}>Item</Text>
                <Text style={styles.cellHeader}>Motivo</Text>
                <Text style={styles.cellHeader}>Cancelado por</Text>
                <Text style={styles.cellHeader}>Quando</Text>
              </View>
              {data.cancelled.map((c) => (
                <View key={c.id} style={styles.tableRow}>
                  <Text style={styles.cell}>{formatDate(c.performedAt)}</Text>
                  <Text style={styles.cell}>{c.itemType}</Text>
                  <Text style={styles.cell}>{c.cancelReason || "—"}</Text>
                  <Text style={styles.cell}>{c.cancelledByName || "—"}</Text>
                  <Text style={styles.cell}>{c.cancelledAt ? formatDate(c.cancelledAt) : "—"}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Seção 4 — Itens pendentes/vencidos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens pendentes ou vencidos ({data.pendingItems.length})</Text>
          {data.pendingItems.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum item pendente ou vencido no momento da geração.</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.cellHeader}>Item</Text>
                <Text style={styles.cellHeader}>Categoria</Text>
                <Text style={styles.cellHeader}>Próximo vencimento</Text>
                <Text style={styles.cellHeader}>Status</Text>
                <Text style={styles.cellHeader}>Dias em atraso</Text>
              </View>
              {data.pendingItems.map((i) => (
                <View key={i.id} style={styles.tableRow}>
                  <Text style={styles.cell}>{i.itemType}</Text>
                  <Text style={styles.cell}>{i.itemCategory}</Text>
                  <Text style={styles.cell}>{formatDate(i.nextDueAt)}</Text>
                  <Text style={styles.cell}>{STATUS_LABEL[i.status] ?? i.status}</Text>
                  <Text style={styles.cell}>{i.daysOverdue > 0 ? i.daysOverdue : "—"}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
