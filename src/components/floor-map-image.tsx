"use client";

import * as React from "react";
import { updateDeskCoordinates } from "@/services/deskCoordinatesService";

const FLOOR_PLAN_SRC =
  "https://ucarecdn.com/f1930ed5-649e-4da8-ad0b-2bdf6f1bfee9/-/format/auto/";

type Desk = {
  id: string;       // MZ001..MZ066
  label: string;    // same as id
  xN: number;       // 0..1 normalized
  yN: number;       // 0..1 normalized (top=1)
  occupied: boolean;
  zone: "Left Wing" | "Right Wing" | "South Zone";
  user?: string;
  startTime?: string;
  endTime?: string;
};

type DragState = {
  deskId: string;
  startX: number;
  startY: number;
  startXN: number;
  startYN: number;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function pad3(n: number) {
  return String(n).padStart(3, "0");
}

/**
 * Generates 78 desks with accurate coordinates based on floor plan layout
 * (Available for reference but not called by default)
 */
// @ts-ignore - Function is available for future reference even though currently unused
function generateMZ001to078(): Desk[] {
  const out: Desk[] = [];
  
  // Sample users and their schedules
  const sampleUsers = [
    { name: "Sarah Johnson", startTime: "09:00 AM", endTime: "05:00 PM" },
    { name: "Michael Chen", startTime: "08:30 AM", endTime: "04:30 PM" },
    { name: "Emily Rodriguez", startTime: "10:00 AM", endTime: "06:00 PM" },
    { name: "David Williams", startTime: "09:30 AM", endTime: "05:30 PM" },
    { name: "Lisa Anderson", startTime: "08:00 AM", endTime: "04:00 PM" },
    { name: "James Martinez", startTime: "09:00 AM", endTime: "05:00 PM" },
    { name: "Jennifer Lee", startTime: "10:30 AM", endTime: "06:30 PM" },
    { name: "Robert Taylor", startTime: "09:00 AM", endTime: "05:00 PM" },
    { name: "Maria Garcia", startTime: "08:30 AM", endTime: "04:30 PM" },
    { name: "Christopher Brown", startTime: "09:00 AM", endTime: "05:00 PM" },
  ];

  // Helper function to create desks with exact coordinates
  const addDesk = (index: number, xN: number, yN: number, zone: Desk["zone"]) => {
    const isOccupied = Math.random() < 0.75;
    let user: string | undefined;
    let startTime: string | undefined;
    let endTime: string | undefined;

    if (isOccupied) {
      const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      user = randomUser.name;
      startTime = randomUser.startTime;
      endTime = randomUser.endTime;
    }

    out.push({
      id: `MZ${pad3(index)}`,
      label: `MZ${pad3(index)}`,
      xN: clamp01(xN),
      yN: clamp01(yN),
      occupied: isOccupied,
      zone,
      user,
      startTime,
      endTime,
    });
  };

  // LEFT WING TOP (MZ001-MZ006) - 6 desks
  addDesk(1, 0.10, 0.12, "Left Wing");
  addDesk(2, 0.14, 0.12, "Left Wing");
  addDesk(3, 0.18, 0.12, "Left Wing");
  addDesk(4, 0.10, 0.18, "Left Wing");
  addDesk(5, 0.14, 0.18, "Left Wing");
  addDesk(6, 0.18, 0.18, "Left Wing");

  // LEFT WING MID (MZ007-MZ012) - 6 desks
  addDesk(7, 0.10, 0.28, "Left Wing");
  addDesk(8, 0.14, 0.28, "Left Wing");
  addDesk(9, 0.18, 0.28, "Left Wing");
  addDesk(10, 0.10, 0.34, "Left Wing");
  addDesk(11, 0.14, 0.34, "Left Wing");
  addDesk(12, 0.18, 0.34, "Left Wing");

  // LEFT WING LOWER-MID (MZ013-MZ017) - 5 desks
  addDesk(13, 0.10, 0.42, "Left Wing");
  addDesk(14, 0.14, 0.42, "Left Wing");
  addDesk(15, 0.18, 0.42, "Left Wing");
  addDesk(16, 0.12, 0.48, "Left Wing");
  addDesk(17, 0.16, 0.48, "Left Wing");

  // LEFT WING SOUTH (MZ018-MZ021) - 4 desks
  addDesk(18, 0.08, 0.58, "Left Wing");
  addDesk(19, 0.13, 0.58, "Left Wing");
  addDesk(20, 0.08, 0.64, "Left Wing");
  addDesk(21, 0.13, 0.64, "Left Wing");

  // RIGHT WING TOP (MZ022-MZ027) - 6 desks
  addDesk(22, 0.82, 0.12, "Right Wing");
  addDesk(23, 0.86, 0.12, "Right Wing");
  addDesk(24, 0.90, 0.12, "Right Wing");
  addDesk(25, 0.82, 0.18, "Right Wing");
  addDesk(26, 0.86, 0.18, "Right Wing");
  addDesk(27, 0.90, 0.18, "Right Wing");

  // RIGHT WING MID (MZ028-MZ033) - 6 desks
  addDesk(28, 0.82, 0.28, "Right Wing");
  addDesk(29, 0.86, 0.28, "Right Wing");
  addDesk(30, 0.90, 0.28, "Right Wing");
  addDesk(31, 0.82, 0.34, "Right Wing");
  addDesk(32, 0.86, 0.34, "Right Wing");
  addDesk(33, 0.90, 0.34, "Right Wing");

  // RIGHT WING LOWER-MID (MZ034-MZ038) - 5 desks
  addDesk(34, 0.82, 0.42, "Right Wing");
  addDesk(35, 0.86, 0.42, "Right Wing");
  addDesk(36, 0.90, 0.42, "Right Wing");
  addDesk(37, 0.84, 0.48, "Right Wing");
  addDesk(38, 0.88, 0.48, "Right Wing");

  // RIGHT WING SOUTH (MZ039-MZ042) - 4 desks
  addDesk(39, 0.87, 0.58, "Right Wing");
  addDesk(40, 0.92, 0.58, "Right Wing");
  addDesk(41, 0.87, 0.64, "Right Wing");
  addDesk(42, 0.92, 0.64, "Right Wing");

  // CENTER TOP (MZ043-MZ050) - 8 desks
  addDesk(43, 0.35, 0.14, "South Zone");
  addDesk(44, 0.42, 0.14, "South Zone");
  addDesk(45, 0.49, 0.14, "South Zone");
  addDesk(46, 0.56, 0.14, "South Zone");
  addDesk(47, 0.35, 0.20, "South Zone");
  addDesk(48, 0.42, 0.20, "South Zone");
  addDesk(49, 0.49, 0.20, "South Zone");
  addDesk(50, 0.56, 0.20, "South Zone");

  // CENTER MIDDLE AREA (MZ051-MZ058) - 8 desks
  addDesk(51, 0.35, 0.38, "South Zone");
  addDesk(52, 0.42, 0.38, "South Zone");
  addDesk(53, 0.49, 0.38, "South Zone");
  addDesk(54, 0.56, 0.38, "South Zone");
  addDesk(55, 0.35, 0.44, "South Zone");
  addDesk(56, 0.42, 0.44, "South Zone");
  addDesk(57, 0.49, 0.44, "South Zone");
  addDesk(58, 0.56, 0.44, "South Zone");

  // SOUTH ZONE ROW 1 (MZ059-MZ066) - 8 desks
  addDesk(59, 0.22, 0.56, "South Zone");
  addDesk(60, 0.32, 0.56, "South Zone");
  addDesk(61, 0.42, 0.56, "South Zone");
  addDesk(62, 0.52, 0.56, "South Zone");
  addDesk(63, 0.62, 0.56, "South Zone");
  addDesk(64, 0.72, 0.56, "South Zone");
  addDesk(65, 0.78, 0.56, "South Zone");
  addDesk(66, 0.65, 0.62, "South Zone");

  // SOUTH ZONE ROW 2 (MZ067-MZ074) - 8 desks
  addDesk(67, 0.22, 0.72, "South Zone");
  addDesk(68, 0.32, 0.72, "South Zone");
  addDesk(69, 0.42, 0.72, "South Zone");
  addDesk(70, 0.52, 0.72, "South Zone");
  addDesk(71, 0.62, 0.72, "South Zone");
  addDesk(72, 0.72, 0.72, "South Zone");
  addDesk(73, 0.78, 0.78, "South Zone");
  addDesk(74, 0.65, 0.80, "South Zone");

  // SOUTH ZONE ROW 3 (MZ075-MZ078) - 4 desks
  addDesk(75, 0.35, 0.88, "South Zone");
  addDesk(76, 0.45, 0.88, "South Zone");
  addDesk(77, 0.55, 0.88, "South Zone");
  addDesk(78, 0.65, 0.88, "South Zone");

  return out;
}

interface FloorMapImageProps {
  isAdminMode?: boolean;
  onDeskCoordinatesChange?: (deskId: string, xN: number, yN: number) => void;
}

export interface FloorMapImageHandle {
  addDesk: () => void;
  addMultipleDesks: (prefix: string, count: number) => void;
}

const FloorMapImage = React.forwardRef<FloorMapImageHandle, FloorMapImageProps>(
  function FloorMapImage({ isAdminMode = false, onDeskCoordinatesChange }, ref) {
  const [desks, setDesks] = React.useState<Desk[]>([]);
  const [hoveredDesk, setHoveredDesk] = React.useState<string | null>(null);
  const [dragState, setDragState] = React.useState<DragState | null>(null);
  const [dragPreview, setDragPreview] = React.useState<{ xN: number; yN: number } | null>(null);
  const [selectedDesks, setSelectedDesks] = React.useState<Set<string>>(new Set());
  const svgRef = React.useRef<SVGSVGElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Convert SVG client coordinates to normalized coordinates (0-1)
  const getNormalizedCoords = (clientX: number, clientY: number): { xN: number; yN: number } | null => {
    if (!svgRef.current) return null;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();

    // Get SVG's viewBox and preserveAspectRatio bounds
    const viewBox = svg.viewBox.baseVal;
    
    // Calculate the actual displayed dimensions accounting for preserveAspectRatio
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    const viewBoxAspect = viewBox.width / viewBox.height;
    const containerAspect = containerWidth / containerHeight;

    let svgDisplayWidth = containerWidth;
    let svgDisplayHeight = containerHeight;
    let svgDisplayLeft = 0;
    let svgDisplayTop = 0;

    // Calculate the actual SVG display area (accounting for centering with xMidYMid)
    if (viewBoxAspect > containerAspect) {
      // SVG is wider than container
      svgDisplayHeight = containerWidth / viewBoxAspect;
      svgDisplayTop = (containerHeight - svgDisplayHeight) / 2;
    } else {
      // SVG is taller than container
      svgDisplayWidth = containerHeight * viewBoxAspect;
      svgDisplayLeft = (containerWidth - svgDisplayWidth) / 2;
    }

    // Calculate relative position within the actual SVG display area
    const relX = clientX - rect.left - svgDisplayLeft;
    const relY = clientY - rect.top - svgDisplayTop;

    // Convert to normalized coordinates based on viewBox
    // Note: yN=0 is at bottom, yN=1 is at top (inverted from SVG coordinates)
    let xN = relX / svgDisplayWidth;
    let yN = 1 - (relY / svgDisplayHeight);

    // Extended range to allow dragging past borders
    // The image has black borders that occupy viewBox space
    // Allow desks to be positioned well beyond the 0-1 range
    return {
      xN: xN,  // No clamping on X
      yN: yN,  // No clamping on Y - allow full range
    };
  };

  const handleMouseDown = (desk: Desk, e: React.MouseEvent) => {
    if (!isAdminMode || !svgRef.current) return;

    e.preventDefault();
    e.stopPropagation();
    
    const coords = getNormalizedCoords(e.clientX, e.clientY);
    if (!coords) return;

    setDragState({
      deskId: desk.id,
      startX: e.clientX,
      startY: e.clientY,
      startXN: desk.xN,
      startYN: desk.yN,
    });

    setHoveredDesk(desk.id);
  };

  React.useEffect(() => {
    if (!dragState) {
      setDragPreview(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const coords = getNormalizedCoords(e.clientX, e.clientY);
      if (!coords) return;

      // Update preview position
      setDragPreview({
        xN: coords.xN,
        yN: coords.yN,
      });
    };

    const handleMouseUp = async (e: MouseEvent) => {
      const coords = getNormalizedCoords(e.clientX, e.clientY);
      if (!coords || !dragState) {
        setDragState(null);
        setDragPreview(null);
        return;
      }

      // Only update if position actually changed
      if (coords.xN !== dragState.startXN || coords.yN !== dragState.startYN) {
        // Update desk position in state
        setDesks(prevDesks =>
          prevDesks.map(d =>
            d.id === dragState.deskId
              ? { ...d, xN: coords.xN, yN: coords.yN }
              : d
          )
        );

        // Sync with backend
        await updateDeskCoordinates(dragState.deskId, coords.xN, coords.yN);

        // Call the callback to sync with backend
        if (onDeskCoordinatesChange) {
          onDeskCoordinatesChange(dragState.deskId, coords.xN, coords.yN);
        }
      }

      setDragState(null);
      setDragPreview(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, onDeskCoordinatesChange]);

  // Handle keyboard shortcuts for multi-select and alignment
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAdminMode) return;

      // Enter to align selected desks
      if (e.key === 'Enter' && selectedDesks.size > 1) {
        e.preventDefault();
        handleAlignDesks();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminMode, selectedDesks, desks]);

  const handleAlignDesks = () => {
    if (selectedDesks.size < 2) return;

    const selectedDeskIds = Array.from(selectedDesks);
    const desksToAlign = desks.filter(d => selectedDeskIds.includes(d.id));

    if (desksToAlign.length < 2) return;

    // Sort by X coordinate
    const sorted = [...desksToAlign].sort((a, b) => a.xN - b.xN);

    // Get the Y coordinate from the first desk (will align all to this Y)
    const targetY = sorted[0].yN;

    // Calculate equal spacing
    const minX = sorted[0].xN;
    const maxX = sorted[sorted.length - 1].xN;
    const spacing = (maxX - minX) / (sorted.length - 1);

    // Update desks with aligned positions
    const updatedDesks = desks.map(desk => {
      const index = sorted.findIndex(d => d.id === desk.id);
      if (index !== -1) {
        const newXN = minX + spacing * index;
        return { ...desk, xN: newXN, yN: targetY };
      }
      return desk;
    });

    setDesks(updatedDesks);
    setSelectedDesks(new Set());
  };

  const handleDeskClick = (deskId: string, e: React.MouseEvent) => {
    if (e.ctrlKey && e.shiftKey && isAdminMode) {
      e.stopPropagation();
      setSelectedDesks(prev => {
        const newSet = new Set(prev);
        if (newSet.has(deskId)) {
          newSet.delete(deskId);
        } else {
          newSet.add(deskId);
        }
        return newSet;
      });
    }
  };

  const handleAddDesk = () => {
    const newDeskNumber = desks.length + 1;
    const newDesk: Desk = {
      id: `DESK${pad3(newDeskNumber)}`,
      label: `DESK${pad3(newDeskNumber)}`,
      xN: 0.5,
      yN: 0.5,
      occupied: false,
      zone: 'South Zone',
    };
    setDesks([...desks, newDesk]);
  };

  const handleAddMultipleDesks = (prefix: string, count: number) => {
    const newDesks: Desk[] = [];
    const startIndex = desks.length + 1;
    
    for (let i = 0; i < count; i++) {
      const deskNumber = startIndex + i;
      newDesks.push({
        id: `${prefix}${pad3(deskNumber)}`,
        label: `${prefix}${pad3(deskNumber)}`,
        xN: 0.5,
        yN: 0.5,
        occupied: false,
        zone: 'South Zone',
      });
    }
    
    setDesks([...desks, ...newDesks]);
  };

  const handleDeleteDesk = (deskId: string) => {
    setDesks(desks.filter(d => d.id !== deskId));
    setHoveredDesk(null);
  };

  React.useImperativeHandle(ref, () => ({
    addDesk: handleAddDesk,
    addMultipleDesks: handleAddMultipleDesks,
  }));

  const handleBackgroundClick = () => {
    // Read-only: no-op
  };

  const getTooltipContent = (desk: Desk) => {
    return (
      <div
        style={{
          background: "rgba(10,10,10,0.92)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 12,
          padding: "10px 12px",
          color: "rgba(255,255,255,0.92)",
          boxShadow: "0 14px 50px rgba(0,0,0,0.55)",
          minWidth: 240,
          zIndex: 1000,
          position: "absolute",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 13 }}>{desk.label}</div>
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
          Status: <b>{desk.occupied ? "Occupied" : "Available"}</b>
        </div>
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
          Zone: <b>{desk.zone}</b>
        </div>
        {desk.user ? (
          <>
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
              User: <b>{desk.user}</b>
            </div>
            {desk.startTime ? (
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
                Start: <b>{desk.startTime}</b>
              </div>
            ) : null}
            {desk.endTime ? (
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.9 }}>
                End: <b>{desk.endTime}</b>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    );
  };

  return (
    <div style={{ width: "100%", background: "transparent", height: "100%" }}>
      <div
        style={{
          borderRadius: 0,
          border: "none",
          background: "transparent",
          boxShadow: "none",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >

        {/* Map area */}
        <div
          ref={containerRef}
          style={{
            position: "relative",
            width: "100%",
            flex: 1,
            minHeight: "400px",
            background: "transparent",
            overflow: "visible",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: isAdminMode && dragState ? "grabbing" : isAdminMode ? "grab" : "default",
          }}
          onClick={handleBackgroundClick}
        >
          <img
            src={FLOOR_PLAN_SRC}
            alt="Floor plan"
            draggable={false}
            style={{
              position: "relative",
              width: "100%",
              height: "auto",
              objectFit: "contain",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />

          {/* SVG Overlay for desks */}
          <svg
            ref={svgRef}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
            viewBox="0 0 1 1"
            preserveAspectRatio="xMidYMid meet"
          >
            {desks.map((desk) => {
              const isHovered = hoveredDesk === desk.id;
              const isDragging = dragState?.deskId === desk.id;
              const deskWidth = 0.025;
              const deskHeight = 0.012;

              // Use preview position if dragging, otherwise use desk position
              const displayXN = isDragging && dragPreview ? dragPreview.xN : desk.xN;
              const displayYN = isDragging && dragPreview ? dragPreview.yN : desk.yN;

              return (
                <g key={desk.id}>
                  {/* Monitor screen */}
                  <g
                    style={{
                      cursor: isAdminMode ? "grab" : "pointer",
                      opacity: isDragging ? 0.8 : 1,
                      filter: isDragging ? "drop-shadow(0 0 4px rgba(251, 191, 36, 0.7))" : "none",
                      transition: isDragging ? "none" : "all 0.1s ease",
                    }}
                    onMouseEnter={() => setHoveredDesk(desk.id)}
                    onMouseLeave={() => !isDragging && setHoveredDesk(null)}
                    onMouseDown={(e) => handleMouseDown(desk, e)}
                    onClick={(e) => handleDeskClick(desk.id, e)}
                  >
                    {/* Monitor screen rect */}
                    <rect
                      x={displayXN - deskWidth / 2}
                      y={1 - displayYN - deskHeight / 2}
                      width={deskWidth}
                      height={deskHeight * 0.75}
                      fill={desk.occupied ? "#dc2626" : "#16a34a"}
                      stroke={desk.occupied ? "#991b1b" : "#15803d"}
                      strokeWidth={0.0008}
                      rx="0.0006"
                    />
                    {/* Monitor stand/base */}
                    <rect
                      x={displayXN - deskWidth * 0.15}
                      y={1 - displayYN - deskHeight / 2 + deskHeight * 0.75}
                      width={deskWidth * 0.3}
                      height={deskHeight * 0.25}
                      fill={desk.occupied ? "#7f1d1d" : "#166534"}
                      stroke={desk.occupied ? "#991b1b" : "#15803d"}
                      strokeWidth={0.0005}
                      rx="0.0003"
                    />
                  </g>

                  {/* Hover highlight border */}
                  {isHovered && (
                    <rect
                      x={displayXN - deskWidth / 2 - 0.002}
                      y={1 - displayYN - deskHeight / 2 - 0.002}
                      width={deskWidth + 0.004}
                      height={deskHeight + 0.004}
                      fill="none"
                      stroke={isDragging ? "#fbbf24" : "#fbbf24"}
                      strokeWidth={isDragging ? 0.0016 : 0.0012}
                      rx="0.001"
                      style={{
                        pointerEvents: "none",
                        transition: isDragging ? "none" : "all 0.1s ease",
                      }}
                    />
                  )}

                  {/* Selection highlight for multi-select mode */}
                  {selectedDesks.has(desk.id) && (
                    <rect
                      x={displayXN - deskWidth / 2 - 0.003}
                      y={1 - displayYN - deskHeight / 2 - 0.003}
                      width={deskWidth + 0.006}
                      height={deskHeight + 0.006}
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth={0.002}
                      rx="0.0015"
                      style={{
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  {/* Desk label on hover */}
                  {isHovered && (
                    <text
                      x={displayXN}
                      y={1 - displayYN - 0.025}
                      textAnchor="middle"
                      fontSize="0.015"
                      fill="rgba(255,255,255,0.95)"
                      style={{
                        pointerEvents: "none",
                        fontWeight: "bold",
                        textShadow: "0 0 3px rgba(0,0,0,0.9)",
                      }}
                    >
                      {desk.label}
                    </text>
                  )}

                  {/* Delete button (admin mode only) */}
                  {isAdminMode && isHovered && (
                    <g>
                      {/* Delete button background circle */}
                      <circle
                        cx={displayXN + deskWidth / 2 + 0.01}
                        cy={1 - displayYN - deskHeight / 2 - 0.01}
                        r="0.008"
                        fill="#ef4444"
                        stroke="#991b1b"
                        strokeWidth={0.0006}
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete desk ${desk.label}?`)) {
                            handleDeleteDesk(desk.id);
                          }
                        }}
                      />
                      {/* X icon */}
                      <text
                        x={displayXN + deskWidth / 2 + 0.01}
                        y={1 - displayYN - deskHeight / 2 - 0.008}
                        textAnchor="middle"
                        fontSize="0.014"
                        fill="white"
                        style={{
                          pointerEvents: "none",
                          fontWeight: "bold",
                        }}
                      >
                        ×
                      </text>
                    </g>
                  )}

                  {/* Coordinates display during drag */}
                  {isDragging && dragPreview && (
                    <text
                      x={displayXN}
                      y={1 - displayYN + 0.035}
                      textAnchor="middle"
                      fontSize="0.012"
                      fill="#fbbf24"
                      style={{
                        pointerEvents: "none",
                        fontWeight: "bold",
                      }}
                    >
                      x: {(displayXN * 100).toFixed(1)}% y: {(displayYN * 100).toFixed(1)}%
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Multi-select mode indicator */}
          {selectedDesks.size > 0 && isAdminMode && (
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "rgba(139, 92, 246, 0.9)",
                color: "white",
                padding: "12px 16px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                pointerEvents: "none",
                zIndex: 50,
              }}
            >
              <div>DESKS SELECTED: {selectedDesks.size}</div>
              <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.9 }}>
                CTRL+SHIFT+Click to select/deselect
              </div>
              <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.9 }}>
                Press ENTER to align desks
              </div>
            </div>
          )}

          {/* Tooltip - positioned relative to hovered desk */}
          {hoveredDesk && !dragState && svgRef.current && containerRef.current && (() => {
            const deskData = desks.find(d => d.id === hoveredDesk);
            if (!deskData) return null;
            
            const svg = svgRef.current;
            const svgRect = svg!.getBoundingClientRect();
            const viewBox = svg!.viewBox.baseVal;
            
            // Calculate SVG display dimensions (same as coordinate calculation)
            const containerWidth = svgRect.width;
            const containerHeight = svgRect.height;
            const viewBoxAspect = viewBox.width / viewBox.height;
            const containerAspect = containerWidth / containerHeight;
            
            let svgDisplayWidth = containerWidth;
            let svgDisplayHeight = containerHeight;
            let svgDisplayLeft = 0;
            let svgDisplayTop = 0;
            
            if (viewBoxAspect > containerAspect) {
              svgDisplayHeight = containerWidth / viewBoxAspect;
              svgDisplayTop = (containerHeight - svgDisplayHeight) / 2;
            } else {
              svgDisplayWidth = containerHeight * viewBoxAspect;
              svgDisplayLeft = (containerWidth - svgDisplayWidth) / 2;
            }
            
            // Calculate pixel position of desk relative to container
            const pixelX = svgDisplayLeft + (deskData.xN * svgDisplayWidth);
            const pixelY = svgDisplayTop + ((1 - deskData.yN) * svgDisplayHeight);
            
            const tooltipWidth = 280;
            const tooltipHeight = 165;
            const padding = 15;
            const offset = 12;
            
            // Default position: top-right of desk
            let tooltipX = pixelX + offset;
            let tooltipY = pixelY - offset - tooltipHeight;
            
            // Check bounds and adjust position
            const leftBound = padding;
            const rightBound = containerWidth - padding;
            const topBound = padding;
            const bottomBound = containerHeight - padding;
            
            // Adjust horizontal position if needed
            if (tooltipX + tooltipWidth / 2 > rightBound) {
              // Too close to right border, move to left side
              tooltipX = pixelX - offset - tooltipWidth;
            } else if (tooltipX - tooltipWidth / 2 < leftBound) {
              // Too close to left border, keep right (default)
              tooltipX = pixelX + offset;
            }
            
            // Adjust vertical position if needed
            if (tooltipY < topBound) {
              // Too close to top border, move below desk
              tooltipY = pixelY + offset;
            } else if (tooltipY + tooltipHeight > bottomBound) {
              // Too close to bottom border, move above desk
              tooltipY = pixelY - offset - tooltipHeight;
            }
            
            // Final bounds clipping to ensure tooltip stays visible
            tooltipX = Math.max(leftBound + tooltipWidth / 2, Math.min(tooltipX, rightBound - tooltipWidth / 2));
            tooltipY = Math.max(topBound, Math.min(tooltipY, bottomBound - tooltipHeight));
            
            return (
              <div 
                style={{ 
                  position: "absolute",
                  left: `${tooltipX}px`,
                  top: `${tooltipY}px`,
                  pointerEvents: "none",
                  transform: "translateX(-50%)",
                }}
              >
                {getTooltipContent(deskData)}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
});

FloorMapImage.displayName = 'FloorMapImage';

export default FloorMapImage;

