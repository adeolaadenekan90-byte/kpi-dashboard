import React, { useState, useMemo } from "react";

const initialData = {
  sla: { openTasks: 18, overdueTasks: 3 },
  turnaround: { tasksCompleted: 26, totalDays: 52 },
  capacity: { teamMembers: 5, hoursAvailable: 200, hoursAllocated: 168 },
  bottleneck: { stage: "Client approval step", daysStuck: 4 },
  rework: { totalTasks: 60, reworked: 6 },
  sop: { checked: 20, following: 17 },
  complaints: { interactions: 140, complaints: 5 },
};

function pct(n) {
  return `${Number(n || 0).toFixed(1)}%`;
}

function Field({ label, value, onChange, suffix }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      <span style={styles.fieldInputWrap}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          style={styles.fieldInput}
        />
        {suffix && <span style={styles.fieldSuffix}>{suffix}</span>}
      </span>
    </label>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      <span style={styles.fieldInputWrap}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={styles.fieldInput}
        />
      </span>
    </label>
  );
}

function Section({ eyebrow, title, children }) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHead}>
        <span style={styles.eyebrow}>{eyebrow}</span>
        <h2 style={styles.sectionTitle}>{title}</h2>
      </div>
      <div style={styles.sectionBody}>{children}</div>
    </section>
  );
}

function healthColor(score) {
  if (score >= 80) return "#4F9D69";
  if (score >= 60) return "#D9A441";
  return "#C9634B";
}

export default function OpsHealthDashboard() {
  const [data, setData] = useState(initialData);
  const [editing, setEditing] = useState(false);

  const slaRate = data.sla.openTasks
    ? ((data.sla.openTasks - data.sla.overdueTasks) / data.sla.openTasks) * 100
    : 100;
  const avgTurnaround = data.turnaround.tasksCompleted
    ? data.turnaround.totalDays / data.turnaround.tasksCompleted
    : 0;
  const utilization = data.capacity.hoursAvailable
    ? (data.capacity.hoursAllocated / data.capacity.hoursAvailable) * 100
    : 0;
  const reworkRate = data.rework.totalTasks
    ? (data.rework.reworked / data.rework.totalTasks) * 100
    : 0;
  const sopRate = data.sop.checked ? (data.sop.following / data.sop.checked) * 100 : 100;
  const complaintRate = data.complaints.interactions
    ? (data.complaints.complaints / data.complaints.interactions) * 100
    : 0;

  const healthScore = useMemo(() => {
    const parts = [slaRate, sopRate, 100 - reworkRate, 100 - complaintRate];
    return parts.reduce((a, b) => a + b, 0) / parts.length;
  }, [slaRate, sopRate, reworkRate, complaintRate]);

  const update = (group, key, v) => setData({ ...data, [group]: { ...data[group], [key]: v } });

  const today = new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <div style={styles.brand}>OPS HEALTH LEDGER</div>
          <div style={styles.brandSub}>Making the operation run smoothly</div>
        </div>
        <button style={styles.toggle} onClick={() => setEditing((e) => !e)}>
          {editing ? "View dashboard" : "Enter this week's numbers"}
        </button>
      </div>

      <div style={{ ...styles.stamp, borderColor: healthColor(healthScore) }}>
        <div style={styles.stampInner}>
          <div style={styles.stampDate}>{today}</div>
          <div style={{ ...styles.stampLabel, color: healthColor(healthScore) }}>Overall Ops Health Score</div>
          <div style={styles.stampValue}>{healthScore.toFixed(0)}/100</div>
          <div style={styles.stampDelta}>Blend of SLA, SOP adherence, rework, and complaint rate</div>
        </div>
      </div>

      <div style={styles.grid}>
        <Section eyebrow="01 — SLA" title="Task / SLA Tracker">
          {editing ? (
            <>
              <Field label="Open tasks" value={data.sla.openTasks} onChange={(v) => update("sla", "openTasks", v)} />
              <Field label="Overdue tasks" value={data.sla.overdueTasks} onChange={(v) => update("sla", "overdueTasks", v)} />
            </>
          ) : (
            <>
              <div style={styles.bigNumber}>{pct(slaRate)}</div>
              <div style={styles.smallNote}>{data.sla.overdueTasks} overdue of {data.sla.openTasks} open tasks</div>
            </>
          )}
        </Section>

        <Section eyebrow="02 — Speed" title="Turnaround Time">
          {editing ? (
            <>
              <Field label="Tasks completed" value={data.turnaround.tasksCompleted} onChange={(v) => update("turnaround", "tasksCompleted", v)} />
              <Field label="Total days spent" value={data.turnaround.totalDays} onChange={(v) => update("turnaround", "totalDays", v)} />
            </>
          ) : (
            <>
              <div style={styles.bigNumber}>{avgTurnaround.toFixed(1)} days</div>
              <div style={styles.smallNote}>Average, across {data.turnaround.tasksCompleted} completed tasks</div>
            </>
          )}
        </Section>

        <Section eyebrow="03 — Capacity" title="Team Capacity">
          {editing ? (
            <>
              <Field label="Team members" value={data.capacity.teamMembers} onChange={(v) => update("capacity", "teamMembers", v)} />
              <Field label="Hours available" value={data.capacity.hoursAvailable} onChange={(v) => update("capacity", "hoursAvailable", v)} />
              <Field label="Hours allocated" value={data.capacity.hoursAllocated} onChange={(v) => update("capacity", "hoursAllocated", v)} />
            </>
          ) : (
            <>
              <div style={styles.bigNumber}>{pct(utilization)}</div>
              <div style={styles.smallNote}>
                {utilization > 100 ? "Team is overloaded" : utilization > 85 ? "Running near full capacity" : "Healthy headroom"} · {data.capacity.teamMembers} people
              </div>
            </>
          )}
        </Section>

        <Section eyebrow="04 — Bottlenecks" title="Bottleneck Tracker">
          {editing ? (
            <>
              <TextField label="Stuck stage" value={data.bottleneck.stage} onChange={(v) => update("bottleneck", "stage", v)} />
              <Field label="Days stuck" value={data.bottleneck.daysStuck} onChange={(v) => update("bottleneck", "daysStuck", v)} />
            </>
          ) : (
            <>
              <div style={styles.bigNumber}>{data.bottleneck.daysStuck}d</div>
              <div style={styles.smallNote}>Longest hold-up: {data.bottleneck.stage}</div>
            </>
          )}
        </Section>

        <Section eyebrow="05 — Quality" title="Error / Rework Rate">
          {editing ? (
            <>
              <Field label="Total tasks" value={data.rework.totalTasks} onChange={(v) => update("rework", "totalTasks", v)} />
              <Field label="Tasks reworked" value={data.rework.reworked} onChange={(v) => update("rework", "reworked", v)} />
            </>
          ) : (
            <>
              <div style={styles.bigNumber}>{pct(reworkRate)}</div>
              <div style={styles.smallNote}>{data.rework.reworked} of {data.rework.totalTasks} tasks needed rework</div>
            </>
          )}
        </Section>

        <Section eyebrow="06 — Process" title="SOP Adherence">
          {editing ? (
            <>
              <Field label="Processes checked" value={data.sop.checked} onChange={(v) => update("sop", "checked", v)} />
              <Field label="Following SOP" value={data.sop.following} onChange={(v) => update("sop", "following", v)} />
            </>
          ) : (
            <>
              <div style={styles.bigNumber}>{pct(sopRate)}</div>
              <div style={styles.smallNote}>{data.sop.following} of {data.sop.checked} checks followed SOP</div>
            </>
          )}
        </Section>

        <Section eyebrow="07 — Customer Impact" title="Complaint / Escalation Rate">
          {editing ? (
            <>
              <Field label="Total interactions" value={data.complaints.interactions} onChange={(v) => update("complaints", "interactions", v)} />
              <Field label="Complaints raised" value={data.complaints.complaints} onChange={(v) => update("complaints", "complaints", v)} />
            </>
          ) : (
            <>
              <div style={styles.bigNumber}>{pct(complaintRate)}</div>
              <div style={styles.smallNote}>{data.complaints.complaints} complaints of {data.complaints.interactions} interactions</div>
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
    maxWidth: 900,
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
    maxWidth: 900,
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
    marginTop: 10,
    letterSpacing: 0.5,
  },
  stampValue: {
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
    fontSize: 42,
    fontWeight: 600,
    marginTop: 6,
  },
  stampDelta: { fontSize: 12, marginTop: 8, color: "#8B93A1" },
  grid: {
    maxWidth: 900,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
  bigNumber: {
    fontFamily: "ui-monospace, Menlo, monospace",
    fontSize: 30,
    fontWeight: 600,
  },
  smallNote: { fontSize: 12, color: "#8B93A1" },
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
  fieldSuffix: { color: "#8B93A1", marginLeft: 6, fontSize: 12 },
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
