export const CHART_COLORS = {
  coral: "#FF385C",
  coralSoft: "#FF6B81",
  teal: "#00A699",
  blue: "#3B82F6",
  orange: "#FFB400",
  slate: "#717171",
  grid: "#EBEBEB",
} as const;

export const CHART_PALETTE = [
  CHART_COLORS.coral,
  CHART_COLORS.teal,
  CHART_COLORS.blue,
  CHART_COLORS.coralSoft,
  CHART_COLORS.orange,
  "#FF385C",
  "#00A699",
  "#3B82F6",
];

export const chartTick = { fontSize: 12, fill: "#717171", fontFamily: "Inter, sans-serif" };

export const chartGrid = { stroke: CHART_COLORS.grid, strokeDasharray: "4 4", vertical: false };

export const tooltipStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #EBEBEB",
  borderRadius: "16px",
  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
  padding: "12px 16px",
  fontSize: "13px",
  color: "#222222",
};

export const legendStyle = { fontSize: 12, color: "#717171", paddingTop: 16 };
