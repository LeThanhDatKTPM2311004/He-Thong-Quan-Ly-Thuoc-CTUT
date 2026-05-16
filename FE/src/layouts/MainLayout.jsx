import Title from "../components/Title.jsx";
import SideBar from "../components/SideBar.jsx";
import Button from "../components/Button.jsx";
import Search from "../components/Search.jsx";
import LogoCTUT from "../assets/images/LogoCTUT.png";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../services/authService";
import { useState, useEffect, useCallback } from "react";
import { getMedicines } from "../services/medicineService";

function useRouteKeyword(pathname, searchBatch) {
  const [state, setState] = useState({
    keyword: "",
    resolvedSearchBatch: null,
    trackedPathname: pathname,
  });

  // Tính giá trị mới ngay trong render — không dùng effect
  const nextKeyword =
    state.trackedPathname !== pathname && !searchBatch ? "" : state.keyword;

  const nextResolved =
    state.trackedPathname !== pathname && !searchBatch
      ? null
      : state.resolvedSearchBatch;

  const nextTracked = pathname;

  const isStale =
    state.trackedPathname !== pathname ||
    state.keyword !== nextKeyword ||
    state.resolvedSearchBatch !== nextResolved;

  if (isStale) {
    setState({
      keyword: nextKeyword,
      resolvedSearchBatch: nextResolved,
      trackedPathname: nextTracked,
    });
  }

  const setKeyword = useCallback((kw) => {
    setState((prev) => ({ ...prev, keyword: kw }));
  }, []);

  const setResolvedSearchBatch = useCallback((val) => {
    setState((prev) => ({ ...prev, resolvedSearchBatch: val }));
  }, []);

  return {
    keyword: state.keyword,
    resolvedSearchBatch: state.resolvedSearchBatch,
    setKeyword,
    setResolvedSearchBatch,
  };
}

export default function MainLayout({
  hideHeader = true,
  title = "Quản Lí Tài Khoản",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchBatch = location.state?.searchBatch ?? null;

  const { keyword, resolvedSearchBatch, setKeyword, setResolvedSearchBatch } =
    useRouteKeyword(location.pathname, searchBatch);

  // Resolve searchBatch → tên thuốc (chỉ có async mới cần effect)
  useEffect(() => {
    if (!searchBatch) return;

    const resolveBatch = async () => {
      try {
        const res = await getMedicines({
          page: 0,
          size: 100,
          sortBy: "id",
          sortDir: "asc",
        });

        let medicineName = "";
        for (const item of res.content) {
          const found = item.batches.find((b) => b.id === searchBatch);
          if (found) {
            medicineName = item.name;
            break;
          }
        }

        if (medicineName) setKeyword(medicineName);
        setResolvedSearchBatch(searchBatch);
      } catch (err) {
        console.error("Không thể resolve searchBatch:", err);
        setResolvedSearchBatch(searchBatch);
      }
    };

    resolveBatch();
  }, [searchBatch, setKeyword, setResolvedSearchBatch]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <div className="flex w-full bg-[#D4D4D4]">
        <div className="h-screen w-1/5 shadow-xl bg-white flex flex-col fixed z-10 top-0 left-0">
          <div className="flex items-center pl-12 pt-5">
            <img src={LogoCTUT} alt="Logo CTUT" className="w-10 h-10" />
            <Title
              title="Hệ Thống Quản Lí Thuốc "
              subtitle="Trường Đại học Kĩ Thuật - Công Nghệ Cần Thơ"
            />
          </div>
          <SideBar />
          <Button
            className="bottom-[10%] bg-[#951010] text-white hover:scale-105 transition-transform absolute left-[30%] font-bold"
            onClick={handleLogout}
          >
            ĐĂNG XUẤT
          </Button>
        </div>
        <div className="w-full h-screen relative flex flex-col">
          <Search
            hideHeader={hideHeader}
            title={title}
            keyword={keyword}
            onSearch={(kw) => setKeyword(kw)}
          />
          <Outlet context={{ keyword, searchBatch: resolvedSearchBatch }} />
        </div>
      </div>
    </>
  );
}
