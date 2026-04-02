import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ScatterChart,
  Scatter,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import FillTime from "../components/FillTime.jsx";
// Thay thế bằng API call
const mockData = {
  mostUsedMedicine: {
    month: "01/2025",
    name: "Thuốc chuột",
    used: 125,
    total: 150,
    unit: "Viên",
  },
  mostCommonDisease: {
    month: "01/2025",
    mainDisease: {
      name: "Trĩ",
      percentage: 75,
    },
    otherDiseases: [
      { name: "Viêm gan", percentage: 7 },
      { name: "Sốt siêu vi", percentage: 5.2 },
    ],
  },
  monthlyCases: {
    month: "01/2025",
    total: 12,
    unit: "Ca",
    comparedToPrevious: 36.24,
    trend: "down", // "up" | "down"
  },
};
//

const COLORS = {
  primary: "#2563EB",
  primaryLight: "#DBEAFE",
  gray: "#E5E7EB",
  textDark: "#111827",
  textMid: "#374151",
  textLight: "#6B7280",
  green: "#10B981",
  red: "#EF4444",
  white: "#FFFFFF",
};

// --- Card 1
function MedicineCard({ data }) {
  const { name, used, total, unit, month } = data;
  const percentage = total > 0 ? Math.round((used / total) * 100) : 0;
  return (
    <div
      style={styles.card}
      className="rounded-2xl border border-[#E6ECF1] bg-[#FDFDFD] shadow-[8px_8px_20px_0_rgba(80,136,183,0.15)]"
    >
      <p style={styles.label}>
        Tỉ lệ sử dụng nhiều nhất
        <br />
        tháng {month}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          marginTop: 8,
        }}
      >
        <span style={styles.bigNumber}>{used}</span>
        <span style={styles.unit}>{unit}</span>
        <span style={{ ...styles.smallText, marginLeft: "auto" }}>
          {used} / {total} viên
        </span>
      </div>

      {/* Progress bar tự scale theo percentage thực */}
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressBar, width: `${percentage}%` }} />
      </div>
      <span style={styles.percentText}>{percentage}%</span>

      <p style={styles.medicineName}>{name}</p>
    </div>
  );
}

// --- Card 2
const RADIAN = Math.PI / 180;

function DiseaseCard({ data }) {
  const { month, mainDisease, otherDiseases } = data;
  const remaining = 100 - mainDisease.percentage;

  const chartData = [
    { name: mainDisease.name, value: mainDisease.percentage },
    { name: "Khác", value: remaining },
  ];

  const renderCustomLabel = ({ cx, cy }) => (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: 13, fontWeight: 700, fill: COLORS.textDark }}
    >
      {mainDisease.name}
    </text>
  );

  return (
    <div
      style={styles.card}
      className="rounded-2xl border border-[#E6ECF1] bg-[#FDFDFD] shadow-[8px_8px_20px_0_rgba(80,136,183,0.15)]"
    >
      <p style={styles.label}>
        Tỉ lệ mắc nhiều nhất
        <br />
        tháng {month}
      </p>
      <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={styles.bigNumber}>{mainDisease.percentage}%</span>
          </div>
          <div style={{ marginTop: 10 }}>
            {otherDiseases.map((d) => (
              <p key={d.name} style={{ ...styles.smallText, margin: "3px 0" }}>
                <span style={{ color: COLORS.primary, fontWeight: 600 }}>
                  {d.percentage}%
                </span>{" "}
                {d.name}
              </p>
            ))}
          </div>
        </div>

        {/* Donut chart */}
        <div
          style={{ width: 110, height: 110, marginLeft: "auto", flexShrink: 0 }}
        >
          <ResponsiveContainer width={110} height={110}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={50}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
                strokeWidth={0}
              >
                <Cell fill={COLORS.primary} />
                <Cell fill={COLORS.gray} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// --- Card 3
function CasesCard({ data }) {
  const { total, unit, comparedToPrevious, trend } = data;
  const isUp = trend === "up";

  return (
    <div
      style={styles.card}
      className="rounded-2xl border border-[#E6ECF1] bg-[#FDFDFD] shadow-[8px_8px_20px_0_rgba(80,136,183,0.15)]"
    >
      <p style={styles.label}>Tổng ca bệnh trong tháng</p>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          marginTop: 8,
        }}
      >
        <span style={styles.bigNumber}>{total}</span>
        <span style={styles.unit}>{unit}</span>
      </div>
      <div style={{ marginTop: 24 }}>
        <p style={styles.smallText}>So với tháng trước</p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            marginTop: 4,
            backgroundColor: isUp ? "#264580" : "#FEE2E2",
            color: isUp ? "#FFFFFF" : "#DC2626",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span>{isUp ? "↑" : "↓"}</span>
          <span>{comparedToPrevious}%</span>
        </div>
      </div>
    </div>
  );
}
// ===================== STYLES =====================
const styles = {
  wrapper: {
    display: "flex",
    gap: 16,
    fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
    flexWrap: "wrap",
  },
  card: {
    flex: "1 1 220px",
    padding: "18px 20px",
    minWidth: 220,
    maxWidth: 360,
  },
  label: {
    fontSize: 13,
    color: COLORS.textLight,
    margin: 0,
    lineHeight: 1.5,
  },
  bigNumber: {
    fontSize: 38,
    fontWeight: 700,
    color: COLORS.textDark,
    lineHeight: 1,
  },
  unit: {
    fontSize: 14,
    color: COLORS.textMid,
    fontWeight: 500,
  },
  smallText: {
    fontSize: 12,
    color: COLORS.textLight,
    margin: 0,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.gray,
    borderRadius: 99,
    marginTop: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 99,
    transition: "width 0.8s ease",
  },
  percentText: {
    fontSize: 11,
    color: COLORS.textLight,
    display: "block",
    marginTop: 3,
  },
  medicineName: {
    fontSize: 13,
    fontWeight: 600,
    color: COLORS.textDark,
    marginTop: 8,
    marginBottom: 0,
  },
};
// Mock data - sau này thay bằng API call
const mockColData = [
  {
    tenThuoc: "Paracetamol",
    soLuongNhap: 2,
    soLuongXuat: 8,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Amoxicillin",
    soLuongNhap: 7,
    soLuongXuat: 5,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Ibuprofen",
    soLuongNhap: 14,
    soLuongXuat: 7,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Vitamin C",
    soLuongNhap: 7,
    soLuongXuat: 13,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Cetirizine",
    soLuongNhap: 15,
    soLuongXuat: 16,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Metformin",
    soLuongNhap: 17,
    soLuongXuat: 13,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Amoxicillin",
    soLuongNhap: 7,
    soLuongXuat: 5,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Ibuprofen",
    soLuongNhap: 14,
    soLuongXuat: 7,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Vitamin C",
    soLuongNhap: 7,
    soLuongXuat: 13,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Cetirizine",
    soLuongNhap: 15,
    soLuongXuat: 16,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Metformin",
    soLuongNhap: 17,
    soLuongXuat: 13,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Paracetamol",
    soLuongNhap: 2,
    soLuongXuat: 8,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Amoxicillin",
    soLuongNhap: 7,
    soLuongXuat: 5,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Ibuprofen",
    soLuongNhap: 14,
    soLuongXuat: 7,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Vitamin C",
    soLuongNhap: 7,
    soLuongXuat: 13,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Cetirizine",
    soLuongNhap: 15,
    soLuongXuat: 16,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Metformin",
    soLuongNhap: 17,
    soLuongXuat: 13,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Amoxicillin",
    soLuongNhap: 7,
    soLuongXuat: 5,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Ibuprofen",
    soLuongNhap: 14,
    soLuongXuat: 7,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Vitamin C",
    soLuongNhap: 7,
    soLuongXuat: 13,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Cetirizine",
    soLuongNhap: 15,
    soLuongXuat: 16,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
  {
    tenThuoc: "Metformin",
    soLuongNhap: 17,
    soLuongXuat: 13,
    thoiGianBatDau: "2025-01-01",
    thoiGianKetThuc: "2026-12-12",
  },
];

const XUAT_COLOR = "#B51C1C";
const NHAP_COLOR = "#264580";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: 6,
          padding: "10px 16px",
          fontSize: 13,
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        <p style={{ fontWeight: 700, marginBottom: 6, color: "#333" }}>
          {label}
        </p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color, margin: "2px 0" }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function MedicineChart() {
  // Lấy ngày từ data (có thể thay bằng state để filter sau)
  const startDate = mockColData[0]?.thoiGianBatDau ?? "";
  const endDate = mockColData[0]?.thoiGianKetThuc ?? "";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const chartData = useMemo(
    () =>
      mockColData.map((item) => ({
        name: item.tenThuoc,
        "Số lượng nhập": item.soLuongNhap,
        "Số lượng xuất": item.soLuongXuat,
      })),
    [],
  );

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "#fff",
        padding: "32px 5px",
        maxWidth: "75%",
        margin: "0 auto",
      }}
    >
      {/* Tiêu đề */}
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 1,
            color: "#111",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          Thống kê số lượng nhập/xuất thuốc
        </h2>
        <label
          style={{
            fontSize: 12,
            color: "#555",
            marginTop: 4,
            display: "flex",
            justifyContent: "center",
            gap: 4,
            fontWeight: "bold",
          }}
        >
          Từ <p style={{ color: "#264580" }}>{formatDate(startDate)}</p> Đến{" "}
          <p style={{ color: "#264580" }}>{formatDate(endDate)}</p>
        </label>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 50, left: 10, bottom: 40 }}
            barCategoryGap="30%"
            barGap={4}
          >
            <CartesianGrid
              vertical={true}
              strokeDasharray="4 4"
              stroke="#e8e8e8"
            />
            <XAxis
              dataKey="name"
              axisLine={{ stroke: "#000000", strokeWidth: 2 }}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#555" }}
              label={{
                value: "Tên thuốc",
                position: "insideRight",
                offset: 20,
                dx: 70,
                dy: -15,
                fontSize: 12,
                fontWeight: 400,
                fill: "#000",
                fontStyle: "italic",
              }}
            />
            <YAxis
              axisLine={{ stroke: "#000000", strokeWidth: 2 }}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#555" }}
              label={{
                value: "Số lượng",
                angle: 0,
                position: "insideTop",
                offset: -30,
                fontSize: 12,
                fill: "#000",
                fontWeight: 400,
                fontStyle: "italic",
                dx: 20,
              }}
              tickCount={6}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="square"
              iconSize={12}
              wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
              formatter={(value) => (
                <span style={{ color: "#333" }}>{value}</span>
              )}
            />
            <Bar
              dataKey="Số lượng nhập"
              fill={NHAP_COLOR}
              radius={[2, 2, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              dataKey="Số lượng xuất"
              fill={XUAT_COLOR}
              radius={[2, 2, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const mockPlotData = [
  {
    tenThuoc: "Paracetamol",
    maLo: "LOT-001",
    hanSuDung: "2026-02-29",
    soLuong: 100,
  },
  {
    tenThuoc: "Paracetamol",
    maLo: "LOT-002",
    hanSuDung: "2026-06-01",
    soLuong: 115,
  },
  {
    tenThuoc: "Amoxicillin",
    maLo: "LOT-003",
    hanSuDung: "2026-03-05",
    soLuong: 145,
  },
  {
    tenThuoc: "Amoxicillin",
    maLo: "LOT-004",
    hanSuDung: "2026-02-28",
    soLuong: 80,
  },
  {
    tenThuoc: "Vitamin C",
    maLo: "LOT-005",
    hanSuDung: "2026-04-10",
    soLuong: 175,
  },
  {
    tenThuoc: "Vitamin C",
    maLo: "LOT-006",
    hanSuDung: "2026-03-15",
    soLuong: 160,
  },
  {
    tenThuoc: "Ibuprofen",
    maLo: "LOT-007",
    hanSuDung: "2026-05-01",
    soLuong: 190,
  },
  {
    tenThuoc: "Ibuprofen",
    maLo: "LOT-008",
    hanSuDung: "2026-03-25",
    soLuong: 200,
  },
  {
    tenThuoc: "Cetirizine",
    maLo: "LOT-009",
    hanSuDung: "2026-06-20",
    soLuong: 220,
  },
  {
    tenThuoc: "Cetirizine",
    maLo: "LOT-010",
    hanSuDung: "2026-07-01",
    soLuong: 235,
  },
  {
    tenThuoc: "Metformin",
    maLo: "LOT-011",
    hanSuDung: "2026-03-15",
    soLuong: 250,
  },
  {
    tenThuoc: "Metformin",
    maLo: "LOT-012",
    hanSuDung: "2026-03-01",
    soLuong: 260,
  },
  {
    tenThuoc: "Omeprazole",
    maLo: "LOT-013",
    hanSuDung: "2026-03-10",
    soLuong: 110,
  },
  {
    tenThuoc: "Omeprazole",
    maLo: "LOT-014",
    hanSuDung: "2026-03-18",
    soLuong: 125,
  },
  {
    tenThuoc: "Atorvastatin",
    maLo: "LOT-015",
    hanSuDung: "2026-05-20",
    soLuong: 185,
  },
  {
    tenThuoc: "Atorvastatin",
    maLo: "LOT-016",
    hanSuDung: "2026-06-05",
    soLuong: 210,
  },
  {
    tenThuoc: "Losartan",
    maLo: "LOT-017",
    hanSuDung: "2026-08-20",
    soLuong: 255,
  },
  {
    tenThuoc: "Losartan",
    maLo: "LOT-018",
    hanSuDung: "2026-09-01",
    soLuong: 270,
  },
  {
    tenThuoc: "Azithromycin",
    maLo: "LOT-019",
    hanSuDung: "2026-02-26",
    soLuong: 60,
  },
  {
    tenThuoc: "Azithromycin",
    maLo: "LOT-020",
    hanSuDung: "2026-02-28",
    soLuong: 75,
  },
];

const ZONES = [
  {
    x1: 0,
    x2: 3,
    fill: "rgba(139,0,0,0.16)",
    stroke: "#8B0000",
    label: "< 3",
    labelColor: "#8B0000",
    desc: "Đặc biệt nguy hiểm",
  },
  {
    x1: 3,
    x2: 7,
    fill: "rgba(220,38,38,0.13)",
    stroke: "#DC2626",
    label: "3–7",
    labelColor: "#DC2626",
    desc: "Nguy hiểm",
  },
  {
    x1: 7,
    x2: 14,
    fill: "rgba(202,138,4,0.13)",
    stroke: "#CA8A04",
    label: "7–14",
    labelColor: "#CA8A04",
    desc: "Cảnh báo",
  },
  {
    x1: 14,
    x2: 30,
    fill: "rgba(234,88,12,0.09)",
    stroke: "#EA580C",
    label: "14–30",
    labelColor: "#EA580C",
    desc: "Chú ý",
  },
];

const X_MAX = 30;
const Y_MAX = 310;
const DIVIDERS = [
  { x: 3, color: "#8B0000" },
  { x: 7, color: "#DC2626" },
  { x: 14, color: "#CA8A04" },
];

function buildColorMap(names) {
  const total = names.length;
  const map = {};
  // Bắt đầu từ hue=25 (tránh đỏ xung đột với vùng cảnh báo), bước đều
  const HUE_START = 25;
  const HUE_RANGE = 320; // tránh hue gần 0/360 để không gần đỏ cảnh báo
  names.forEach((name, i) => {
    const h = (HUE_START + Math.round((i / total) * HUE_RANGE)) % 360;
    // Xen kẽ saturation/lightness để màu sát nhau trên vòng hue vẫn khác nhau
    const s = i % 2 === 0 ? 72 : 58;
    const l = i % 3 === 0 ? 38 : i % 3 === 1 ? 44 : 50;
    map[name] = `hsl(${h}, ${s}%, ${l}%)`;
  });
  return map;
}
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

function daysUntilExpiry(dateStr) {
  const exp = new Date(dateStr);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp - TODAY) / (1000 * 60 * 60 * 24));
}

function getZoneInfo(days) {
  if (days <= 0) return { color: "#8B0000", label: "⛔ Đã hết hạn" };
  if (days < 3) return { color: "#8B0000", label: "⛔ Đặc biệt nguy hiểm" };
  if (days < 7) return { color: "#DC2626", label: "🔴 Nguy hiểm" };
  if (days < 14) return { color: "#CA8A04", label: "🟡 Cảnh báo" };
  return { color: "#EA580C", label: "🟠 Chú ý" };
}

// ===================== CUSTOM DOT =====================
const SquareDot = (props) => {
  const { cx, cy, fill } = props;
  const s = 12;
  return (
    <rect
      x={cx - s / 2}
      y={cy - s / 2}
      width={s}
      height={s}
      fill={fill}
      rx={1.5}
      opacity={0.93}
    />
  );
};

// ===================== TOOLTIP =====================
const ExpiryTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const zone = getZoneInfo(d.daysLeft);
  return (
    <div
      style={{
        background: "#fff",
        border: `2px solid ${d.color}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
        minWidth: 175,
      }}
    >
      <p
        style={{
          fontWeight: 700,
          color: d.color,
          marginBottom: 5,
          fontSize: 13,
        }}
      >
        {d.tenThuoc}
      </p>
      <p style={{ color: "#555", margin: "2px 0" }}>
        Lô: <strong>{d.maLo}</strong>
      </p>
      <p style={{ color: "#555", margin: "2px 0" }}>
        Hạn SD: <strong>{d.hanSuDung}</strong>
      </p>
      <p style={{ color: "#555", margin: "2px 0" }}>
        Số lượng: <strong>{d.soLuong}</strong>
      </p>
      <div
        style={{
          marginTop: 7,
          padding: "3px 8px",
          borderRadius: 5,
          background: zone.color + "18",
          color: zone.color,
          fontWeight: 600,
          fontSize: 11,
          display: "inline-block",
        }}
      >
        {d.daysLeft <= 0
          ? zone.label
          : `${zone.label} (còn ${d.daysLeft} ngày)`}
      </div>
    </div>
  );
};

// ===================== LEGEND =====================
function ChartLegend({ medicines }) {
  return (
    <div style={{ marginTop: 20 }}>
      {/* Zone legend */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        {ZONES.map(({ fill, stroke, desc, label }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: "#555",
            }}
          >
            <div
              style={{
                width: 18,
                height: 13,
                background: fill,
                border: `1.5px solid ${stroke}`,
                borderRadius: 2,
                flexShrink: 0,
              }}
            />
            <span>
              <strong style={{ color: stroke }}>{label} ngày</strong> — {desc}
            </span>
          </div>
        ))}
      </div>

      {/* Medicine legend */}
      {medicines.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 20px",
            justifyContent: "center",
          }}
        >
          {medicines.map(({ name, color }) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "#444",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: color,
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
              <span>{name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p
          style={{
            textAlign: "center",
            color: "#16A34A",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Không có thuốc nào sắp hết hạn trong 30 ngày tới
        </p>
      )}
    </div>
  );
}

// ===================== MAIN =====================
function MedicineExpiryChart() {
  const { scatterGroups, visibleMedicines } = useMemo(() => {
    // 1. Lấy danh sách tên thuốc UNIQUE (theo thứ tự xuất hiện)
    const nameOrder = [];
    mockPlotData.forEach(({ tenThuoc }) => {
      if (!nameOrder.includes(tenThuoc)) nameOrder.push(tenThuoc);
    });

    // 2. Tạo colorMap không lặp màu
    const colorMap = buildColorMap(nameOrder);

    // 3. Lọc & group — chỉ giữ lô < 30 ngày
    const groups = {};
    mockPlotData.forEach((item) => {
      const daysLeft = daysUntilExpiry(item.hanSuDung);
      if (daysLeft >= 30) return; // ← ẩn bình thường
      const point = {
        ...item,
        x: Math.max(0, daysLeft),
        y: item.soLuong,
        daysLeft,
        color: colorMap[item.tenThuoc],
      };
      if (!groups[item.tenThuoc]) groups[item.tenThuoc] = [];
      groups[item.tenThuoc].push(point);
    });

    const visibleNames = Object.keys(groups);
    return {
      visibleMedicines: visibleNames.map((n) => ({
        name: n,
        color: colorMap[n],
      })),
      scatterGroups: visibleNames.map((n) => ({
        name: n,
        color: colorMap[n],
        data: groups[n],
      })),
    };
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Tahoma, sans-serif",
        background: "#fff",
        padding: "32px 40px",
        maxWidth: "75%",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: 1,
          color: "#111",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        Thống kê số lượng thuốc theo hạn sử dụng
      </h2>
      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "#888",
          marginBottom: 28,
        }}
      >
        Chỉ hiển thị thuốc còn dưới 30 ngày hạn sử dụng
      </p>

      <ResponsiveContainer width="100%" height={380}>
        <ScatterChart margin={{ top: 24, right: 30, left: 20, bottom: 45 }}>
          {/* Vùng nền cảnh báo */}
          {ZONES.map(({ x1, x2, fill, stroke }) => (
            <ReferenceArea
              key={`zone-${x1}`}
              x1={x1}
              x2={x2}
              y1={0}
              y2={Y_MAX}
              fill={fill}
              stroke={stroke}
              strokeOpacity={0.4}
              strokeDasharray="4 3"
            />
          ))}

          {/* Đường phân vùng */}
          {DIVIDERS.map(({ x, color }) => (
            <ReferenceLine
              key={`div-${x}`}
              x={x}
              stroke={color}
              strokeDasharray="5 3"
              strokeOpacity={0.65}
              label={{
                value: `${x}`,
                position: "top",
                fontSize: 10,
                fill: color,
                fontWeight: 700,
              }}
            />
          ))}

          <CartesianGrid strokeDasharray="3 3" stroke="#ebebeb" />

          <XAxis
            type="number"
            dataKey="x"
            domain={[0, X_MAX]}
            ticks={[0, 3, 7, 14, 20, 29]}
            tickFormatter={(v) => (v === 29 ? "<30" : String(v))}
            axisLine={{ stroke: "#d9d9d9", strokeWidth: 1 }}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#000" }}
            label={{
              value: "Số ngày còn hạn sử dụng",
              position: "insideBottom",
              offset: -25,
              fontSize: 12,
              fill: "#D9D9D9",
              fontStyle: "italic",
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, Y_MAX]}
            ticks={[50, 100, 150, 200, 250, 300]}
            axisLine={{ stroke: "#d9d9d9", strokeWidth: 1 }}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#000" }}
            label={{
              value: "Số lượng",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fontSize: 12,
              fill: "#D9D9D9",
              fontStyle: "italic",
            }}
          />

          <Tooltip
            content={<ExpiryTooltip />}
            cursor={{ strokeDasharray: "3 3", stroke: "#ccc" }}
          />

          {scatterGroups.map(({ name, color, data }) => (
            <Scatter
              key={name}
              name={name}
              data={data}
              fill={color}
              shape={<SquareDot />}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>

      <ChartLegend medicines={visibleMedicines} />
    </div>
  );
}

export default function Statistics() {
  const [data, setData] = useState(mockData);
  return (
    <>
      <div className="w-3/4 bg-white absolute top-20 left-105 rounded-2xl shadow-xl flex flex-col items-center gap-5 overflow-y-auto max-h-5/6">
        <h1 className="text-3xl font-bold pb-5 pt-10">SỐ LIỆU THỐNG KÊ</h1>
        <div
          style={styles.wrapper}
          className="w-full px-20 py-5 flex items-center justify-between "
        >
          <MedicineCard data={data.mostUsedMedicine} />
          <DiseaseCard data={data.mostCommonDisease} />
          <CasesCard data={data.monthlyCases} />
        </div>
        <FillTime
          label="Tải số liệu theo thời gian tùy chỉnh:"
          button="Xác nhận lọc"
        />
        <div className="w-full">
          {" "}
          <MedicineChart />
        </div>
        <div className="w-full p-5">
          <MedicineExpiryChart />
        </div>
      </div>
    </>
  );
}
