import questionIcon from "../assets/images/questionIcon.png";
import Button from "./Button";
export default function Alert({
  show,
  onClose,
  QuestionIcon = questionIcon,
  color = "#B51C1C",
  textPart1 = "Bạn chắc chắn muốn xóa đơn thuốc",
  main = "gvdvghcvgds",
  textPart2 = "khỏi danh sách không?",
  hidden = "unhidden",
  onCancel,
  onEnter,
  Cancel = "Hủy bỏ",
  Enter = "Tiến hành xóa",
}) {
  const handleCancel = () => {
    onCancel();
  };
  const handleEnter = () => {
    onEnter();
  };
  return (
    <>
      {show && (
        <div className="w-200 bg-white absolute top-35 left-182 h-2/3 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-20">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 font-bold text-xl cursor-pointer"
          >
            x
          </button>
          <div className="flex flex-col items-center justify-center">
            <span
              className={`w-15 h-15 bg-[${color}] flex flex-col items-center justify-center rounded-full`}
            >
              <img src={QuestionIcon} alt="questionIcon" />
            </span>
            <div className="text-2xl flex flex-col items-center justify-center text-center">
              <label className="inter p-5">
                {textPart1}{" "}
                <span className={`text-[${color}] font-bold`}>{main}</span>{" "}
                {textPart2}
              </label>
              <div className="flex items-center justify-center gap-20 text-sm">
                <Button
                  onClick={handleCancel}
                  className={`${hidden} border-1 border-[#D8D6DE] rounded-sm w-30 h-10 hover:border-black`}
                >
                  {Cancel}
                </Button>
                <Button
                  onClick={handleEnter}
                  className={`border-1 border-[#D8D6DE] bg-[${color}] text-white rounded-sm w-40 h-10 `}
                >
                  {Enter}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
