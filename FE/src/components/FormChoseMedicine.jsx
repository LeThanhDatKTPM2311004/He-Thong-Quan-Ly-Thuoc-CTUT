import Button from "./Button";
import { useState } from "react";
import CheckIcon from "../assets/svg/CheckIcon.jsx";

export default function FormChoseMedicine({
  data,
  selectedMedicines,
  onConfirm,
  onCancel,
}) {
  const [selected, setSelected] = useState([]);

  const toggleMedicine = (med) => {
    setSelected((prev) =>
      prev.find((m) => m.id === med.id)
        ? prev.filter((m) => m.id !== med.id)
        : [...prev, med],
    );
  };

  const isSelected = (medId) => selected.find((m) => m.id === medId);

  // Kiểm tra thuốc đã có trong đơn chưa
  const isAlreadyInPrescription = (medId) =>
    selectedMedicines.find((m) => m.id === medId);

  return (
    <div className="w-auto max-w-4xl px-10 py-8 flex flex-col items-center justify-center gap-5 bg-[#224EA1] rounded-lg shadow-lg">
      <h3 className="font-bold text-xl text-white">CHỌN THUỐC</h3>

      <div className="grid grid-cols-3 gap-3 w-full max-h-96 overflow-y-auto mb-6">
        {data.map((med) => {
          const checked = isSelected(med.id);
          const alreadyAdded = isAlreadyInPrescription(med.id);

          return (
            <div
              key={med.id}
              onClick={() => !alreadyAdded && toggleMedicine(med)}
              className={`flex items-center justify-between bg-white px-3 py-2 rounded ${
                alreadyAdded
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-gray-50"
              }`}
            >
              <span className="text-sm flex-1">{med.name}</span>

              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center ml-2 flex-shrink-0">
                {(checked || alreadyAdded) && (
                  <div className="w-4 h-4 rounded-full bg-green-500">
                    <CheckIcon />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-20 w-full mt-auto">
        <Button
          className="bg-[#D21013] w-40 h-10 text-sm font-bold text-white rounded shadow-md"
          onClick={onCancel}
        >
          HỦY BỎ
        </Button>
        <Button
          className="bg-[#14B319] w-40 h-10 text-sm font-bold text-white rounded shadow-md"
          onClick={() => onConfirm(selected)}
        >
          XÁC NHẬN
        </Button>
      </div>
    </div>
  );
}
