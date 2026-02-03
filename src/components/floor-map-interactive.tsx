"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Scatter,
} from "recharts";

const FLOOR_PLAN_SRC =
  "/assets/Modern pentagon-shaped office floor plan.png"; // <-- replace with your real URL
const PLAN_ASPECT_RATIO = 2048 / 1365;

type Desk = {
  id: string;       // MZ001..MZ066
  label: string;    // same as id
  xN: number;       // 0..1 normalized
  yN: number;       // 0..1 normalized (top=1)
  occupied: boolean;
  zone: "Left Wing" | "Right Wing" | "South Zone";
  user?: string;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function pad3(n: number) {
  return String(n).padStart(3, "0");
}

/**
 * Generates 66 desks placed roughly where the bench rows are in your plan:
 * - Left Wing: 22 desks (3 short rows + 2 medium)
 * - Right Wing: 22 desks
 * - South Zone: 22 desks (4 longer rows)
 *
 * You can later replace xN/yN with captured/real positions while keeping IDs stable.
 */
function generateMZ001to066(): Desk[] {
  const out: Desk[] = [];

  // Helper to create a row of points
  const addRow = (
    zone: Desk["zone"],
    startIndexInclusive: number,
    count: number,
    xStart: number,
    xEnd: number,
    y: number
  ) => {
    for (let i = 0; i < count; i++) {
      const idx = startIndexInclusive + i;
      const t = count === 1 ? 0.5 : i / (count - 1);
      const xN = xStart + (xEnd - xStart) * t;

      out.push({
        id: `MZ${pad3(idx)}`,
        label: `MZ${pad3(idx)}`,
        xN: clamp01(xN),
        yN: clamp01(y),
        occupied: Math.random() < 0.75, // demo occupancy
        zone,
      });
    }
  };

  // ---- LEFT WING (MZ001..MZ022) ----
  // Matches the left bench clusters in the plan
  addRow("Left Wing", 1, 6, 0.07, 0.25, 0.88); // top-left bench
  addRow("Left Wing", 7, 6, 0.13, 0.31, 0.68); // mid-left bench
  addRow("Left Wing", 13, 5, 0.15, 0.32, 0.54); // lower-mid-left
  addRow("Left Wing", 18, 5, 0.18, 0.34, 0.36); // near south-left benches

  // ---- RIGHT WING (MZ023..MZ044) ----
  addRow("Right Wing", 23, 6, 0.75, 0.93, 0.88); // top-right bench
  addRow("Right Wing", 29, 6, 0.69, 0.87, 0.68); // mid-right bench
  addRow("Right Wing", 35, 5, 0.68, 0.85, 0.54); // lower-mid-right
  addRow("Right Wing", 40, 5, 0.66, 0.82, 0.36); // near south-right benches

  // ---- SOUTH ZONE (MZ045..MZ066) ----
  // Long rows across the bottom open office
  addRow("South Zone", 45, 6, 0.22, 0.78, 0.46);
  addRow("South Zone", 51, 6, 0.22, 0.78, 0.28);
  addRow("South Zone", 57, 5, 0.26, 0.74, 0.15);
  addRow("South Zone", 62, 5, 0.30, 0.70, 0.09);

  // Ensure exactly 66
  return out.slice(0, 66);
}

function DeskDot(props: any) {
  const { cx, cy, payload } = props as {
    cx: number;
    cy: number;
    payload: Desk & { __dim?: boolean; __selected?: boolean };
  };

  const dim = Boolean((payload as any).__dim);
  const selected = Boolean((payload as any).__selected);

  const r = 7;

  // Occupied/available styling
  const fill = payload.occupied ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.20)";
  const stroke = payload.occupied ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.45)";

  return (
    <g style={{ cursor: "pointer", opacity: dim ? 0.20 : 1 }}>
      {/* selection ring */}
      {selected ? (
        <circle cx={cx} cy={cy} r={r + 6} fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.55)" strokeWidth={2} />
      ) : (
        <circle cx={cx} cy={cy} r={r + 4} fill="rgba(0,0,0,0.25)" />
      )}

      {/* main dot */}
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={1.5} />

      {/* tiny status pip */}
      <circle
        cx={cx + r - 2}
        cy={cy - r + 2}
        r={2.25}
        fill={payload.occupied ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.55)"}
      />
    </g>
  );
}

function FloorTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d: Desk = payload[0].payload;

  return (
    <div
      style={{
        background: "rgba(10,10,10,0.92)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 12,
        padding: "10px 12px",
        color: "rgba(255,255,255,0.92)",
        boxShadow: "0 14px 50px rgba(0,0,0,0.55)",
        minWidth: 220,
        pointerEvents: "none",
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 13 }}>{d.label}</div>
      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
        Status: <b>{d.occupied ? "Occupied" : "Available"}</b>
      </div>
      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
        Zone: <b>{d.zone}</b>
      </div>
      {d.user ? (
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
          User: <b>{d.user}</b>
        </div>
      ) : null}
      <div style={{ marginTop: 8, fontSize: 11, opacity: 0.65 }}>
        xN {d.xN.toFixed(4)} • yN {d.yN.toFixed(4)}
      </div>
    </div>
  );
}

function btnStyle(active = false, disabled = false): React.CSSProperties {
  return {
    background: disabled
      ? "rgba(255,255,255,0.05)"
      : active
      ? "rgba(255,255,255,0.14)"
      : "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: disabled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)",
    borderRadius: 12,
    padding: "7px 10px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.2,
  };
}

export default function FloorMapTab() {
  const [desks, setDesks] = React.useState<Desk[]>(() => generateMZ001to066());

  // Selection
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Capture mode (optional, for you to refine coordinates)
  const [captureMode, setCaptureMode] = React.useState(false);
  const [lastCapture, setLastCapture] = React.useState<{ xN: number; yN: number } | null>(null);

  const hasSelection = selectedIds.size > 0;

  const chartData = React.useMemo(() => {
    return desks.map((d) => {
      const selected = selectedIds.has(d.id);
      const dim = hasSelection && !selected;
      return { ...d, __selected: selected, __dim: dim };
    });
  }, [desks, selectedIds, hasSelection]);

  const clearSelection = () => setSelectedIds(new Set());

  const toggleSelect = (id: string, multi: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (!multi) {
        // single select
        next.clear();
        next.add(id);
        return next;
      }
      // multi-select toggle
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If capture mode is ON, capture; otherwise clear selection
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;

    if (captureMode) {
      const xN = clamp01(x);
      const yN = clamp01(y);
      setLastCapture({ xN, yN });

      const snippet = `{ id: "MZ___", label: "MZ___", xN: ${xN.toFixed(4)}, yN: ${yN.toFixed(
        4
      )}, occupied: false, zone: "South Zone" }`;
      navigator.clipboard?.writeText(snippet).catch(() => {});
      return;
    }

    // Not capture mode -> clear selection
    clearSelection();
  };

  // Example: quick "randomize occupancy" to simulate realtime updates
  const randomize = () => {
    setDesks((prev) =>
      prev.map((d) => ({ ...d, occupied: Math.random() < 0.77 }))
    );
  };

  return (
    <div style={{ width: "100%", background: "transparent" }}>
      <div
        style={{
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(0,0,0,0.25)",
          boxShadow: "0 20px 70px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.35)",
            color: "rgba(255,255,255,0.92)",
          }}
        >
          <div style={{ fontWeight: 900 }}>Floor Map</div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ fontSize: 12, opacity: 0.85 }}>
              Selected: <b>{selectedIds.size}</b>
            </div>

            <button onClick={clearSelection} style={btnStyle(false, !hasSelection)} disabled={!hasSelection}>
              Clear selection
            </button>

            <button onClick={randomize} style={btnStyle()}>
              Simulate refresh
            </button>

            <button onClick={() => setCaptureMode((v) => !v)} style={btnStyle(captureMode)}>
              {captureMode ? "Capture: ON" : "Capture: OFF"}
            </button>
          </div>
        </div>

        {/* Map area */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: `${PLAN_ASPECT_RATIO}`,
            background: "transparent",
          }}
          onClick={handleBackgroundClick}
        >
          <img
            src={FLOOR_PLAN_SRC}
            alt="Floor plan"
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "fill",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />

          {/* Recharts overlay */}
          <div style={{ position: "absolute", inset: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 18, right: 18, bottom: 18, left: 18 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="4 8" />
                <XAxis type="number" dataKey="xN" domain={[0, 1]} hide />
                <YAxis type="number" dataKey="yN" domain={[0, 1]} hide />

                <Tooltip
                  content={<FloorTooltip />}
                  cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
                  isAnimationActive={false}
                />

                <Scatter
                  dataKey="yN"
                  shape={(props: any) => {
                    const { payload } = props as any;

                    return (
                      <g
                        onClick={(ev) => {
                          ev?.stopPropagation?.();
                          const multi = ev?.shiftKey || ev?.metaKey || ev?.ctrlKey; // shift/cmd/ctrl for multi
                          toggleSelect(payload.id, multi);
                        }}
                      >
                        <DeskDot {...props} />
                      </g>
                    );
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Capture helper */}
          {captureMode ? (
            <div
              style={{
                position: "absolute",
                left: 12,
                bottom: 12,
                padding: "8px 10px",
                borderRadius: 12,
                background: "rgba(0,0,0,0.55)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.9)",
                fontSize: 12,
                pointerEvents: "none",
              }}
            >
              Capture mode: click to copy normalized coords.
              {lastCapture ? (
                <div style={{ marginTop: 6, opacity: 0.85 }}>
                  xN {lastCapture.xN.toFixed(4)} • yN {lastCapture.yN.toFixed(4)}
                </div>
              ) : null}
              <div style={{ marginTop: 6, opacity: 0.75 }}>
                Tip: Shift/Ctrl/Cmd + click desk = multi-select
              </div>
            </div>
          ) : (
            <div
              style={{
                position: "absolute",
                left: 12,
                bottom: 12,
                padding: "8px 10px",
                borderRadius: 12,
                background: "rgba(0,0,0,0.45)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.85)",
                fontSize: 12,
                pointerEvents: "none",
              }}
            >
              Click desk to select • Shift/Ctrl/Cmd for multi-select • Click empty space to clear
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
