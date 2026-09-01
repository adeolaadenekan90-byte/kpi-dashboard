import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

const initialTasks = [
  { id: 1, name: "Vendor contract renewal", owner: "Ada", dueDays: -2, status: "Overdue" },
  { id: 2, name: "Client onboarding — Zyra", owner: "Femi", dueDays: 3, status: "On track" },
  { id: 3, name: "Monthly compliance check", owner: "Bola", dueDays: 1, status: "At risk" },
  { id: 4, name: "Inventory reconciliation", owner: "Ada", dueDays: 5, status: "On track" },
  { id: 5, name: "Customer refund — order 118", owner: "Chidi", dueDays: -1, status: "Overdue" },
  { id: 6, name: "Staff shift schedule", owner: "Femi", dueDays: 2, status: "On track" },
];

const initialTeam = [
  { id: 1, name: "Ada", hoursAvailable: 40, hoursAllocated: 38 },
  { id: 2, name: "Femi", hoursAvailable: 40, hoursAllocated: 44 },
  { id: 3, name: "Bola", hoursAvailable: 32, hoursAllocated: 20 },
  { id: 4, name: "Chidi", hoursAvailable: 40, hoursAllocated: 30 },
];

const weeklyHealth = [
  { week: "Wk 1", score: 74 },
  { week: "Wk 2", score: 78 },
  { week: "Wk 3", score: 71 },
  { week: "Wk 4", score: 82 },
  { week: "Wk 5", score: 85 },
  { week: "This wk", score: 89 },
];

const initialMetrics = {
  rework: { totalTasks: 60, reworked: 6 },
  sop: { checked: 20, following: 17 },
  complaints: { interactions: 140, complaints: 5 },
};

function pct(n) {
  return `${Number(n || 0).toFixed(1)}%`;
}

function statusColor(status) {
  if (status === "Overdue") return "#C9634B";
  if (status === "At risk") return "#D9A441";
  return "#4F9D69";
}

function utilColor(u) {
  if (u > 100) return "#C9634B";
  if (u > 85) return "#D9A441";
  return "#4F9D69";
}

function healthColor(score) {
  if (score >= 80) return "#4F9D69";
  if (score >= 60) return "#D9A441";
  return "#C9634B";
}

function StatCard({ label, value, color, note }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ ...styles.statValue, color: color || "#EDEEF0" }}>{value}</div>
      {note && <div style={styles.statNote}>{note}</div>}
    </div>
  );
}

export default function OpsPulseDashboard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [team, setTeam] = useState(initialTeam);
  const [metrics, setMetrics] = useState(initialMetrics);

  const overdueCount = tasks.filter((t) => t.status === "Overdue").length;
  const atRiskCount = tasks.filter((t) => t.status === "At risk").length;
  const slaRate = tasks.length ? ((tasks.length - overdueCount) / tasks.length) * 100 : 100;

  const reworkRate = metrics.rework.totalTasks
    ? (metrics.rework.reworked / metrics.rework.totalTasks) * 100
    : 0;
  const sopRate = metrics.sop.checked ? (metrics.sop.following / metrics.sop.checked) * 100 : 100;
  const complaintRate = metrics.complaints.interactions
    ? (metrics.complaints.complaints / metrics.complaints.interactions) * 100
    : 0;

  const healthScore = useMemo(() => {
    const parts = [slaRate, sopRate, 100 - reworkRate, 100 - complaintRate];
    return parts.reduce((a, b) => a + b, 0) / parts.length;
  }, [slaRate, sopRate, reworkRate, complaintRate]);

  const updateTask = (id, key, val) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, [key]: val } : t)));
  const updateTeam = (id, key, val) =>
    setTeam(team.map((m) => (m.id === id ? { ...m, [key]: val } : m)));
  const updateMetric = (group, key, val) =>
    setMetrics({ ...metrics, [group]: { ...metrics[group], [key]: val } });

  const barData = [
    { name: "SLA", value: Number(slaRate.toFixed(1)) },
    { name: "SOP", value: Number(sopRate.toFixed(1)) },
    { name: "Rework", value: Number(reworkRate.toFixed(1)) },
    { name: "Complaints", value: Number(complaintRate.toFixed(1)) },
  ];

  const today = new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <div style={styles.brand}>THE OPS PULSE</div>
          <div style={styles.brandSub}>The vital signs of your operation · {today}</div>
        </div>
        <div style={{ ...styles.scoreBadge, borderColor: healthColor(healthScore) }}>
          <div style={styles.scoreLabel}>Ops Health</div>
          <div style={{ ...styles.scoreValue, color: healthColor(healthScore) }}>{healthScore.toFixed(0)}</div>
        </div>
      </div>

      <div style={styles.statRow}>
        <StatCard label="SLA met" value={pct(slaRate)} color={statusColor(overdueCount ? "Overdue" : "On track")} note={`${overdueCount} overdue, ${atRiskCount} at risk`} />
        <StatCard label="SOP adherence" value={pct(sopRate)} note={`${metrics.sop.following}/${metrics.sop.checked} checks`} />
        <StatCard label="Rework rate" value={pct(reworkRate)} color={reworkRate > 15 ? "#C9634B" : "#4F9D69"} note={`${metrics.rework.reworked}/${metrics.rework.totalTasks} tasks`} />
        <StatCard label="Complaint rate" value={pct(complaintRate)} color={complaintRate > 5 ? "#C9634B" : "#4F9D69"} note={`${metrics.complaints.complaints}/${metrics.complaints.interactions}`} />
      </div>

      <div style={styles.chartGrid}>
        <div style={styles.chartCard}>
          <div style={styles.cardTitle}>Ops Health — last 6 weeks</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weeklyHealth}>
              <CartesianGrid stroke="#262B34" vertical={false} />
              <XAxis dataKey="week" stroke="#8B93A1" fontSize={11} />
              <YAxis stroke="#8B93A1" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#1B1F27", border: "1px solid #262B34" }} />
              <Line type="monotone" dataKey="score" stroke="#D9A441" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.chartCard}>
          <div style={styles.cardTitle}>This week's metrics</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData}>
              <CartesianGrid stroke="#262B34" vertical={false} />
              <XAxis dataKey="name" stroke="#8B93A1" fontSize={11} />
              <YAxis stroke="#8B93A1" fontSize={11} />
              <Tooltip contentStyle={{ background: "#1B1F27", border: "1px solid #262B34" }} />
              <Bar dataKey="value" fill="#D9A441" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.cardTitle}>Task Tracker <span style={styles.editHint}>— click any cell to edit</span></div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Task</th>
              <th style={styles.th}>Owner</th>
              <th style={styles.th}>Due (days)</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td style={styles.td}>
                  <input style={styles.cellInput} value={t.name} onChange={(e) => updateTask(t.id, "name", e.target.value)} />
                </td>
                <td style={styles.td}>
                  <input style={styles.cellInput} value={t.owner} onChange={(e) => updateTask(t.id, "owner", e.target.value)} />
                </td>
                <td style={styles.td}>
                  <input
                    style={{ ...styles.cellInput, width: 50 }}
                    type="number"
                    value={t.dueDays}
                    onChange={(e) => updateTask(t.id, "dueDays", Number(e.target.value))}
                  />
                </td>
                <td style={styles.td}>
                  <select style={{ ...styles.cellInput, color: statusColor(t.status) }} value={t.status} onChange={(e) => updateTask(t.id, "status", e.target.value)}>
                    <option>On track</option>
                    <option>At risk</option>
                    <option>Overdue</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.cardTitle}>Team Capacity</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Team member</th>
              <th style={styles.th}>Hours available</th>
              <th style={styles.th}>Hours allocated</th>
              <th style={styles.th}>Utilization</th>
            </tr>
          </thead>
          <tbody>
            {team.map((m) => {
              const util = m.hoursAvailable ? (m.hoursAllocated / m.hoursAvailable) * 100 : 0;
              return (
                <tr key={m.id}>
                  <td style={styles.td}>
                    <input style={styles.cellInput} value={m.name} onChange={(e) => updateTeam(m.id, "name", e.target.value)} />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={{ ...styles.cellInput, width: 60 }}
                      type="number"
                      value={m.hoursAvailable}
                      onChange={(e) => updateTeam(m.id, "hoursAvailable", Number(e.target.value))}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      style={{ ...styles.cellInput, width: 60 }}
                      type="number"
                      value={m.hoursAllocated}
                      onChange={(e) => updateTeam(m.id, "hoursAllocated", Number(e.target.value))}
                    />
                  </td>
                  <td style={styles.td}>
                    <div style={styles.utilBarTrack}>
                      <div style={{ ...styles.utilBarFill, width: `${Math.min(util, 100)}%`, background: utilColor(util) }} />
                    </div>
                    <span style={{ fontSize: 12, color: utilColor(util), marginLeft: 8 }}>{util.toFixed(0)}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.cardTitle}>Quality & Process Inputs</div>
        <div style={styles.inputGrid}>
          <div style={styles.inputGroup}>
            <div style={styles.inputGroupLabel}>Error / Rework</div>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>Total tasks</span>
              <input style={styles.fieldInput2} type="number" value={metrics.rework.totalTasks} onChange={(e) => updateMetric("rework", "totalTasks", Number(e.target.value))} />
            </label>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>Reworked</span>
              <input style={styles.fieldInput2} type="number" value={metrics.rework.reworked} onChange={(e) => updateMetric("rework", "reworked", Number(e.target.value))} />
            </label>
          </div>
          <div style={styles.inputGroup}>
            <div style={styles.inputGroupLabel}>SOP Adherence</div>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>Checked</span>
              <input style={styles.fieldInput2} type="number" value={metrics.sop.checked} onChange={(e) => updateMetric("sop", "checked", Number(e.target.value))} />
            </label>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>Following SOP</span>
              <input style={styles.fieldInput2} type="number" value={metrics.sop.following} onChange={(e) => updateMetric("sop", "following", Number(e.target.value))} />
            </label>
          </div>
          <div style={styles.inputGroup}>
            <div style={styles.inputGroupLabel}>Complaints</div>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>Interactions</span>
              <input style={styles.fieldInput2} type="number" value={metrics.complaints.interactions} onChange={(e) => updateMetric("complaints", "interactions", Number(e.target.value))} />
            </label>
            <label style={styles.field}>
              <span style={styles.fieldLabel}>Complaints</span>
              <input style={styles.fieldInput2} type="number" value={metrics.complaints.complaints} onChange={(e) => updateMetric("complaints", "complaints", Number(e.target.value))} />
            </label>
          </div>
        </div>
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
    alignItems: "center",
    maxWidth: 1000,
    margin: "0 auto 24px",
    flexWrap: "wrap",
    gap: 12,
  },
  brand: { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 22, letterSpacing: 1.5 },
  brandSub: { color: "#8B93A1", fontSize: 13, marginTop: 4 },
  scoreBadge: {
    border: "1px solid",
    borderRadius: 6,
    padding: "8px 18px",
    textAlign: "center",
    background: "#1B1F27",
  },
  scoreLabel: { fontSize: 11, color: "#8B93A1", letterSpacing: 0.5 },
  scoreValue: { fontFamily: "ui-monospace, Menlo, monospace", fontSize: 26, fontWeight: 700 },
  statRow: {
    maxWidth: 1000,
    margin: "0 auto 20px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
  },
  statCard: { background: "#1B1F27", border: "1px solid #262B34", borderRadius: 6, padding: 16 },
  statLabel: { fontSize: 12, color: "#8B93A1" },
  statValue: { fontFamily: "ui-monospace, Menlo, monospace", fontSize: 24, fontWeight: 600, marginTop: 4 },
  statNote: { fontSize: 11, color: "#8B93A1", marginTop: 4 },
  chartGrid: {
    maxWidth: 1000,
    margin: "0 auto 20px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 16,
  },
  chartCard: { background: "#1B1F27", border: "1px solid #262B34", borderRadius: 6, padding: 16 },
  cardTitle: { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 15, marginBottom: 12 },
  editHint: { fontFamily: "ui-sans-serif, sans-serif", fontSize: 11, color: "#565C68" },
  tableCard: {
    maxWidth: 1000,
    margin: "0 auto 16px",
    background: "#1B1F27",
    border: "1px solid #262B34",
    borderRadius: 6,
    padding: 16,
    overflowX: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    fontSize: 11,
    color: "#8B93A1",
    fontWeight: 400,
    padding: "6px 8px",
    borderBottom: "1px solid #262B34",
  },
  td: { padding: "6px 8px", borderBottom: "1px solid #1E232B" },
  cellInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#EDEEF0",
    fontSize: 13,
    width: "100%",
    fontFamily: "ui-sans-serif, sans-serif",
  },
  utilBarTrack: {
    display: "inline-block",
    width: 80,
    height: 6,
    background: "#262B34",
    borderRadius: 3,
    overflow: "hidden",
    verticalAlign: "middle",
  },
  utilBarFill: { height: "100%" },
  inputGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 },
  inputGroup: { display: "flex", flexDirection: "column", gap: 8 },
  inputGroupLabel: { fontSize: 12, color: "#D9A441", marginBottom: 4 },
  field: { display: "flex", flexDirection: "column", gap: 2 },
  fieldLabel: { fontSize: 11, color: "#8B93A1" },
  fieldInput2: {
    background: "#12151A",
    border: "1px solid #262B34",
    borderRadius: 4,
    padding: "6px 8px",
    color: "#EDEEF0",
    fontSize: 13,
    fontFamily: "ui-monospace, Menlo, monospace",
  },
  footer: { textAlign: "center", marginTop: 24, fontSize: 12, color: "#565C68" },
};
