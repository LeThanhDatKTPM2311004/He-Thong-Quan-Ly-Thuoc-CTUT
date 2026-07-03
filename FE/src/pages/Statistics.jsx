import { useState, useMemo, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
} from "recharts";
import FillTime from "../components/FillTime.jsx";
import {
  getStatisticsOverview,
  getMedicineImportExport,
  getExpiryWarning,
} from "../services/statisticsService";

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
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressBar, width: `${percentage}%` }} />
      </div>
      <span style={styles.percentText}>{percentage}%</span>
      <p style={styles.medicineName}>{name}</p>
    </div>
  );
}

// --- Card 2
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
  label: { fontSize: 13, color: COLORS.textLight, margin: 0, lineHeight: 1.5 },
  bigNumber: {
    fontSize: 38,
    fontWeight: 700,
    color: COLORS.textDark,
    lineHeight: 1,
  },
  unit: { fontSize: 14, color: COLORS.textMid, fontWeight: 500 },
  smallText: { fontSize: 12, color: COLORS.textLight, margin: 0 },
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

function MedicineChart({ importExportData, dateRange }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const chartData = useMemo(
    () =>
      importExportData.map((item) => ({
        name: item.medicineName,
        "Số lượng nhập": item.totalImport,
        "Số lượng xuất": item.totalExport,
      })),
    [importExportData],
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
          Từ <p style={{ color: "#264580" }}>{formatDate(dateRange.from)}</p>{" "}
          Đến <p style={{ color: "#264580" }}>{formatDate(dateRange.to)}</p>
        </label>
      </div>
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

// Chỉ khai báo 1 lần
function getZoneInfo(days) {
  if (days <= 0)
    return { color: "#8B0000", label: "Đã hết hạn", bg: "#FEE2E2" };
  if (days < 3)
    return { color: "#8B0000", label: "Đặc biệt nguy hiểm", bg: "#FEE2E2" };
  if (days < 7) return { color: "#DC2626", label: "Nguy hiểm", bg: "#FEE2E2" };
  if (days < 14) return { color: "#CA8A04", label: "Cảnh báo", bg: "#FEF9C3" };
  return { color: "#EA580C", label: "Chú ý", bg: "#FFEDD5" };
}

function MedicineExpiryChart({ expiryData }) {
  const rows = useMemo(
    () =>
      expiryData
        .filter((item) => item.daysLeft < 30)
        .sort((a, b) => a.daysLeft - b.daysLeft),
    [expiryData],
  );

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
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
        Thống kê thuốc sắp hết hạn sử dụng
      </h2>
      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "#888",
          marginBottom: 24,
        }}
      >
        Chỉ hiển thị thuốc còn dưới 30 ngày hạn sử dụng
      </p>

      {rows.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            color: "#16A34A",
            fontWeight: 600,
            fontSize: 14,
            marginTop: 32,
          }}
        >
          ✅ Không có thuốc nào sắp hết hạn trong 30 ngày tới
        </p>
      ) : (
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#F3F4F6",
                borderBottom: "2px solid #E5E7EB",
              }}
            >
              {[
                "STT",
                "Tên thuốc",
                "Số lô",
                "Hạn sử dụng",
                "Số lượng còn lại",
                "Số ngày còn lại",
                "Mức độ",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontWeight: 700,
                    color: "#374151",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((item, i) => {
              const zone = getZoneInfo(item.daysLeft);
              return (
                <tr
                  key={`${item.batchNumber}-${i}`}
                  style={{
                    borderBottom: "1px solid #F3F4F6",
                    backgroundColor: i % 2 === 0 ? "#fff" : "#FAFAFA",
                  }}
                >
                  <td style={{ padding: "10px 14px", color: "#6B7280" }}>
                    {i + 1}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontWeight: 600,
                      color: "#111",
                    }}
                  >
                    {item.medicineName}
                  </td>
                  <td style={{ padding: "10px 14px", color: "#374151" }}>
                    {item.batchNumber}
                  </td>
                  <td style={{ padding: "10px 14px", color: "#374151" }}>
                    {item.expiryDate}
                  </td>
                  <td style={{ padding: "10px 14px", color: "#374151" }}>
                    {item.remainingQuantity}
                  </td>
                  <td
                    style={{
                      padding: "10px 14px",
                      fontWeight: 700,
                      color: zone.color,
                    }}
                  >
                    {item.daysLeft <= 0
                      ? "Đã hết hạn"
                      : `${item.daysLeft} ngày`}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span
                      style={{
                        backgroundColor: zone.bg,
                        color: zone.color,
                        fontWeight: 600,
                        fontSize: 11,
                        padding: "3px 10px",
                        borderRadius: 99,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {zone.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function Statistics() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [overviewData, setOverviewData] = useState(null);
  const [importExportData, setImportExportData] = useState([]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [expiryData, setExpiryData] = useState([]);

  useEffect(() => {
    getStatisticsOverview({ month: currentMonth, year: currentYear })
      .then((res) => setOverviewData(res))
      .catch((err) => console.error("overview error:", err));
  }, []);

  useEffect(() => {
    getMedicineImportExport({})
      .then((res) => setImportExportData(Array.isArray(res) ? res : []))
      .catch((err) => console.error("import/export error:", err));
  }, []);

  useEffect(() => {
    getExpiryWarning()
      .then((res) => setExpiryData(Array.isArray(res) ? res : []))
      .catch((err) => console.error("expiry error:", err));
  }, []);

  const handleFilter = ({ from, to }) => {
    setDateRange({ from, to });
    getMedicineImportExport({ from, to })
      .then((res) => setImportExportData(Array.isArray(res) ? res : []))
      .catch((err) => console.error("filter error:", err));
  };

  const medicineCardData = overviewData
    ? {
        month: `${String(currentMonth).padStart(2, "0")}/${currentYear}`,
        name: overviewData.topMedicineName,
        used: overviewData.topMedicineExported,
        total: overviewData.topMedicineTotalStock,
        unit: overviewData.topMedicineUnit,
      }
    : { month: "", name: "—", used: 0, total: 0, unit: "" };

  const diseaseCardData = useMemo(() => {
    if (!overviewData?.diagnosisList?.length) {
      return {
        month: `${String(currentMonth).padStart(2, "0")}/${currentYear}`,
        mainDisease: { name: "—", percentage: 0 },
        otherDiseases: [],
      };
    }
    const totalCount = overviewData.diagnosisList.reduce(
      (s, d) => s + d.count,
      0,
    );
    const sorted = [...overviewData.diagnosisList].sort(
      (a, b) => b.count - a.count,
    );
    const main = sorted[0];
    const others = sorted.slice(1, 3);
    return {
      month: `${String(currentMonth).padStart(2, "0")}/${currentYear}`,
      mainDisease: {
        name: main.diagnosis,
        percentage:
          totalCount > 0 ? Math.round((main.count / totalCount) * 100) : 0,
      },
      otherDiseases: others.map((d) => ({
        name: d.diagnosis,
        percentage:
          totalCount > 0 ? Math.round((d.count / totalCount) * 100) : 0,
      })),
    };
  }, [overviewData]);

  const casesCardData = overviewData
    ? {
        total: overviewData.totalCasesThisMonth,
        unit: "Ca",
        comparedToPrevious:
          overviewData.totalCasesLastMonth > 0
            ? Math.abs(
                Math.round(
                  ((overviewData.totalCasesThisMonth -
                    overviewData.totalCasesLastMonth) /
                    overviewData.totalCasesLastMonth) *
                    100,
                ),
              )
            : 0,
        trend:
          overviewData.totalCasesThisMonth >= overviewData.totalCasesLastMonth
            ? "up"
            : "down",
      }
    : { total: 0, unit: "Ca", comparedToPrevious: 0, trend: "down" };

  return (
    <div
      style={{ padding: "30px" }}
      className="w-full h-9/10 flex flex-col min-h-0"
    >
      <div className="bg-white flex-1 min-h-0 rounded-2xl shadow-xl flex flex-col overflow-y-auto">
        <h1 className="text-3xl font-bold text-center pb-5 pt-10 flex-shrink-0">
          SỐ LIỆU THỐNG KÊ
        </h1>
        <div
          style={styles.wrapper}
          className="w-full px-10 py-5 flex items-center justify-between flex-shrink-0"
        >
          <MedicineCard data={medicineCardData} />
          <DiseaseCard data={diseaseCardData} />
          <CasesCard data={casesCardData} />
        </div>
        <div className="flex-shrink-0 px-8">
          <FillTime
            label="Tải số liệu theo thời gian tùy chỉnh:"
            button="Xác nhận lọc"
            onChange={handleFilter}
          />
        </div>
        <div className="w-full flex-shrink-0">
          <MedicineChart
            importExportData={importExportData}
            dateRange={dateRange}
          />
        </div>
        <div className="w-full flex-shrink-0 p-5">
          <MedicineExpiryChart expiryData={expiryData} />
        </div>
      </div>
    </div>
  );
}
