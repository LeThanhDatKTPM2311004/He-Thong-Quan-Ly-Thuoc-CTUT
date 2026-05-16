import { useState } from "react";
export default function FormMedicine({
  fields = [],
  initialData = {},
  onChange = () => {},
  readOnly = false,
  variant = "primary",
}) {
  const [formData, setFormData] = useState(initialData);

  const handleInputChange = (fieldName, value) => {
    const newData = { ...formData, [fieldName]: value };
    setFormData(newData);
    onChange(newData);
  };
  const cursorStyle = readOnly ? "" : "cursor-pointer";
  // Styles theo variant
  const labelStyle =
    variant === "primary"
      ? "bg-[#264580] text-white px-3 py-1.5 font-medium text-sm w-30 mb-2"
      : "bg-[#264580] text-white px-2 py-1 font-medium text-xs";

  const inputStyle =
    variant === "primary"
      ? "border-2 border-gray-400 px-3 py-1 mb-2 flex-1 text-sm focus:outline-none focus:border-blue-500"
      : "border-2 border-gray-400 px-2 py-0.5 flex-1 text-xs focus:outline-none focus:border-blue-500";

  // Group fields theo hàng
  const renderFields = () => {
    const rows = [];
    let currentRow = [];

    fields.forEach((field) => {
      currentRow.push(field);

      if (field.width === "full" || currentRow.length === 2) {
        rows.push([...currentRow]);
        currentRow = [];
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows.map((row, rowIndex) => (
      <div key={rowIndex} className="flex gap-5 mb-2">
        {row.map((field) => (
          <div
            key={field.name}
            className={`flex items-center ${field.width === "full" ? "flex-1" : "flex-1"}`}
          >
            <label className={labelStyle}>{field.label}</label>
            <input
              type={field.type || "text"}
              value={formData[field.name] || ""}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              readOnly={field.readOnly || readOnly}
              required={field.required}
              placeholder={field.placeholder || ""}
              className={`${inputStyle} ${readOnly ? "bg-gray-50" : "bg-white"} ${cursorStyle}`}
            />
          </div>
        ))}
      </div>
    ));
  };

  return <div className="w-full">{renderFields()}</div>;
}
