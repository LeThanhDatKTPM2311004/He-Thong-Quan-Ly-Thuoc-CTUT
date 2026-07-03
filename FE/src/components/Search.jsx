import Title from "./Title";
import VectorSearch from "../assets/svg/VectorSearch.jsx";

export default function Search({
  hideHeader = true,
  title = "Quản Lí Tài Khoản",
  onSearch,
  keyword = "",
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch?.(keyword.trim());
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    onSearch?.(value === "" ? "" : value); // truyền thẳng lên, không cần Enter
  };

  return (
    <div className="w-4/5 h-12 pl-5 absolute top-0 left-1/5 overflow-hidden flex items-center bg-[#264580]">
      <Title
        wrapperClass="text-white"
        subtitleClass="text-xs italic"
        title={title}
        subtitle="Phòng Y Tế - Trường Đại học Kỹ Thuật Công Nghệ Cần Thơ"
      />
      {hideHeader && (
        <div className="w-1/3 flex items-center h-7 bg-white rounded-xl ml-50 gap-4">
          <VectorSearch />
          <input
            type="text"
            value={keyword}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="outline-none w-full text-xs text-black"
            placeholder="Tìm kiếm"
          />
        </div>
      )}
    </div>
  );
}
