export default function TableHeader({ columns }) {
  const getPX = () => {
    return columns.length >= 8 ? "px-1" : "px-4";
  };
  return (
    <tr className="bg-[#F9FAFB] text-sm text-[#B5B7C0]">
      {columns.map((col, index) => (
        <th
          key={index}
          className={`${getPX()} py-3 font-medium ${
            col.align === "center" ? "text-center" : "text-left"
          }`}
        >
          {col.label}
        </th>
      ))}
    </tr>
  );
}
