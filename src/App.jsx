import React, { useState, useMemo } from "react";

const initialData = {
  revenue: [
    { label: "This week", value: 420000 },
    { label: "Last week", value: 365000 },
  ],
  orders: { count: 34, customers: 21, repeatCustomers: 9 },
  costs: { cogs: 140000, opex: 65000 },
  channels: [
    { name: "Instagram", revenue: 210000 },
    { name: "Referral", revenue: 120000 },
    { name: "WhatsApp", revenue: 90000 },
  ],
};

function formatNaira(n) {
  return "₦" + Number(n || 0).toLocaleString("en-NG");
}

function Field({ label, value, onChange, prefix }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      <span style={styles.fieldInputWrap}>
        {prefix && <span style={styles.fieldPrefix}>{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          style={styles.fieldInput}
        />
      </span>
    </label>
  );
}

function Section({ eyebrow, title, children, footer }) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHead}>
        <span style={styles.eyebrow}>{eyebrow}</span>
        <h2 style={styles.sectionTitle}>{title}</h2>
      </div>
      <div style={styles.sectionBody}>{children}</div>
      {footer && <div style={styles.sectionFooter}>{footer}</div>}
    </section>
  );
}

export default function KPIDashboard() {
  const [data, setData] = useState(initialData);
  const [editing, setEditing] = useState(false);

  const totalRevenue = data.revenue[0].value;
  const priorRevenue = data.revenue[1].value;
  const revenueDelta = priorRevenue ? ((totalRevenue - priorRevenue) / priorRevenue) * 100 : 0;

  const grossProfit = totalRevenue - data.costs.cogs;
  const netProfit = grossProfit - data.costs.opex;
  const margin = totalRevenue ? (netProfit / totalRevenue) * 100 : 0;

  const avgOrderValue = data.orders.count ? totalRevenue / data.orders.count : 0;
  const repeatRate = data.orders.customers ? (data.orders.repeatCustomers / data.orders.customers) * 100 : 0;

  const topChannel = useMemo(
    () => [...data.channels].sort((a, b) => b.revenue - a.revenue)[0],
    [data.channels]
  );
  const channelTotal = data.channels.reduce((s, c) => s + c.revenue, 0);

  const updateRevenue = (i, v) => {
    const next = [...data.revenue];
    next[i] = { ...next[i], value: v };
    setData({ ...data, revenue: next });
  };
  const updateOrders = (key, v) => setData({ ...data, orders: { ...data.orders, [key]: v } });
  const updateCosts = (key, v) => setData({ ...data, costs: { ...data.costs, [key]: v } });
  const updateChannel = (i, v) => {
    const next = [...data.channels];
    next[i] = { ...next[i], revenue: v };
    setData({ ...data, channels: next });
  };

  const today = new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <div style={styles.brand}>OPERATOR'S LEDGER</div>
          <div style={styles.brandSub}>Turning operations into revenue</div>
        </div>
        <button style={styles.toggle} onClick={() => setEditing((e) => !e)}>
          {editing ? "View dashboard" : "Enter this week's numbers"}
        </button>
      </div>

      <div style={styles.stamp}>
        <div style={styles.stampInner}>
          <div style={styles.stampDate}>{today}</div>
          <div style={styles.stampLabel}>Net profit, this week</div>
          <div style={styles.stampValue}>{formatNaira(netProfit)}</div>
          <div style={{ ...styles.stampDelta, color: revenueDelta >= 0 ? "#4F9D69" : "#C9634B" }}>
            {revenueDelta >= 0 ? "▲" : "▼"} {Math.abs(revenueDelta).toFixed(1)}% revenue vs last week
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <Section eyebrow="01 — Revenue" title="Revenue Snapshot">
          {editing ? (
            <>
              <Field label="This week" prefix="₦" value={data.revenue[0].value} onChange={(v) => updateRevenue(0, v)} />
              <Field label="Last week" prefix="₦" value={data.revenue[1].value} onChange={(v) => updateRevenue(1, v)} />
            </>
          ) : (
            <>
              <div style={styles.bigNumber}>{formatNaira(totalRevenue)}</div>
              <div style={styles.smallNote}>vs {formatNaira(priorRevenue)} last week</div>
            </>
          )}
        </Section>

        <Section eyebrow="02 — Orders & Customers" title="Orders & Customers">
          {editing ? (
            <>
              <Field label="Orders" value={data.orders.count} onChange={(v) => updateOrders("count", v)} />
              <Field label="Customers" value={data.orders.customers} onChange={(v) => updateOrders("customers", v)} />
              <Field label="Repeat customers" value={data.orders.repeatCustomers} onChange={(v) => updateOrders("repeatCustomers", v)} />
            </>
          ) : (
            <>
              <div style={styles.statRow}>
                <div><div style={styles.statValue}>{data.orders.count}</div><div style={styles.statLabel}>Orders</div></div>
                <div><div style={styles.statValue}>{formatNaira(avgOrderValue)}</div><div style={styles.statLabel}>Avg order value</div></div>
                <div><div style={styles.statValue}>{repeatRate.toFixed(0)}%</div><div style={styles.statLabel}>Repeat rate</div></div>
              </div>
            </>
          )}
        </Section>

        <Section eyebrow="03 — Profit Margin" title="Profit Margin">
          {editing ? (
            <>
              <Field label="Cost of goods" prefix="₦" value={data.costs.cogs} onChange={(v) => updateCosts("cogs", v)} />
              <Field label="Operating costs" prefix="₦" value={data.costs.opex} onChange={(v) => updateCosts("opex", v)} />
            </>
          ) : (
            <>
              <div style={styles.bigNumber}>{margin.toFixed(1)}%</div>
              <div style={styles.smallNote}>Gross {formatNaira(grossProfit)} → Net {formatNaira(netProfit)}</div>
            </>
          )}
        </Section>

        <Section eyebrow="04 — Channel Performance" title="Channel Performance">
          {editing ? (
            data.channels.map((c, i) => (
              <Field key={c.name} label={c.name} prefix="₦" value={c.revenue} onChange={(v) => updateChannel(i, v)} />
            ))
          ) : (
            <>
              {data.channels
                .slice()
                .sort((a, b) => b.revenue - a.revenue)
                .map((c) => {
                  const pct = channelTotal ? (c.revenue / channelTotal) * 100 : 0;
                  return (
                    <div key={c.name} style={styles.channelRow}>
                      <div style={styles.channelName}>{c.name === topChannel.name ? "★ " : ""}{c.name}</div>
                      <div style={styles.channelBarTrack}>
                        <div style={{ ...styles.channelBarFill, width: `${pct}%` }} />
                      </div>
                      <div style={styles.channelPct}>{pct.toFixed(0)}%</div>
                    </div>
                  );
                })}
            </>
          )}
        </Section>
      </div>

      <div style={styles.footer}>Manual entry · your numbers stay in this session</div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#12151A",
    color: "#EDEEF0",
    fontFamily: "ui-sans-serif, -apple-system, 'Segoe UI', sans-serif",
    padding: "32px 20px 60px",
    boxSizing: "border-box",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    maxWidth: 760,
    margin: "0 auto 28px",
    flexWrap: "wrap",
    gap: 12,
  },
  brand: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 22,
    letterSpacing: 1.5,
    color: "#EDEEF0",
  },
  brandSub: { color: "#8B93A1", fontSize: 13, marginTop: 4 },
  toggle: {
    background: "transparent",
    border: "1px solid #3A404C",
    color: "#D9A441",
    borderRadius: 4,
    padding: "8px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  stamp: {
    maxWidth: 760,
    margin: "0 auto 32px",
    border: "1px solid #D9A441",
    borderRadius: 2,
    padding: 3,
    transform: "rotate(-0.4deg)",
  },
  stampInner: {
    background: "#171B22",
    padding: "24px 28px",
    textAlign: "center",
  },
  stampDate: {
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
    fontSize: 12,
    color: "#8B93A1",
    letterSpacing: 1,
  },
  stampLabel: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 15,
    color: "#D9A441",
    marginTop: 10,
    letterSpacing: 0.5,
  },
  stampValue: {
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
    fontSize: 42,
    fontWeight: 600,
    marginTop: 6,
  },
  stampDelta: { fontSize: 13, marginTop: 8, fontFamily: "ui-monospace, Menlo, monospace" },
  grid: {
    maxWidth: 760,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 16,
  },
  section: {
    background: "#1B1F27",
    border: "1px solid #262B34",
    borderRadius: 6,
    padding: 20,
  },
  sectionHead: { marginBottom: 14 },
  eyebrow: {
    fontFamily: "ui-monospace, Menlo, monospace",
    fontSize: 11,
    color: "#8B93A1",
    letterSpacing: 1,
  },
  sectionTitle: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 17,
    margin: "4px 0 0",
    fontWeight: 400,
  },
  sectionBody: { display: "flex", flexDirection: "column", gap: 10 },
  sectionFooter: { marginTop: 10, fontSize: 12, color: "#8B93A1" },
  bigNumber: {
    fontFamily: "ui-monospace, Menlo, monospace",
    fontSize: 30,
    fontWeight: 600,
  },
  smallNote: { fontSize: 12, color: "#8B93A1" },
  statRow: { display: "flex", justifyContent: "space-between", gap: 12 },
  statValue: { fontFamily: "ui-monospace, Menlo, monospace", fontSize: 20, fontWeight: 600 },
  statLabel: { fontSize: 11, color: "#8B93A1", marginTop: 4 },
  channelRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
  channelName: { fontSize: 13, width: 100, flexShrink: 0 },
  channelBarTrack: { flex: 1, height: 6, background: "#262B34", borderRadius: 3, overflow: "hidden" },
  channelBarFill: { height: "100%", background: "#D9A441" },
  channelPct: { fontSize: 12, fontFamily: "ui-monospace, Menlo, monospace", width: 32, textAlign: "right" },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  fieldLabel: { fontSize: 12, color: "#8B93A1" },
  fieldInputWrap: {
    display: "flex",
    alignItems: "center",
    background: "#12151A",
    border: "1px solid #262B34",
    borderRadius: 4,
    padding: "6px 10px",
  },
  fieldPrefix: { color: "#8B93A1", marginRight: 6, fontSize: 13 },
  fieldInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#EDEEF0",
    fontSize: 14,
    width: "100%",
    fontFamily: "ui-monospace, Menlo, monospace",
  },
  footer: {
    textAlign: "center",
    marginTop: 32,
    fontSize: 12,
    color: "#565C68",
  },
};
