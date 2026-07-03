import Title from "../components/Title.jsx";
import SideBar from "../components/SideBar.jsx";
import Button from "../components/Button.jsx";
import Search from "../components/Search.jsx";
import LogoCTUT from "../assets/images/LogoCTUT.png";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../services/authService";
import { useState, useEffect, useCallback, useRef } from "react";
import { getMedicines } from "../services/medicineService";
import { useViewportScale } from "../hooks/useViewportScale";

function useRouteKeyword(pathname, searchBatch) {
  const [state, setState] = useState({
    keyword: "",
    resolvedSearchBatch: null,
    trackedPathname: pathname,
  });

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
  const searchBatchT = location.state?._t ?? null;

  const scale = useViewportScale();

  const { keyword, resolvedSearchBatch, setKeyword, setResolvedSearchBatch } =
    useRouteKeyword(location.pathname, searchBatch);

  const clearedRef = useRef(false);
  useEffect(() => {
    if (clearedRef.current) return;
    if (location.state?.searchBatch) {
      clearedRef.current = true;
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  useEffect(() => {
    if (!searchBatch) return;
    setKeyword("");
    setResolvedSearchBatch(null);

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
  }, [searchBatchT]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <div
        className="flex bg-[#D4D4D4]"
        style={{
          zoom: scale,
          width: `${100 / scale}vw`,
          height: `${100 / scale}vh`,
        }}
      >
        {/* ── Sidebar ───────────────────────────────────────────────── */}
        <div className="w-1/5 h-full bg-white shadow-xl flex flex-col flex-shrink-0 relative">
          <div className="flex items-center pl-12 pt-5">
            <img src={LogoCTUT} alt="Logo CTUT" className="w-10 h-10" />
            <Title
              title="Hệ Thống Quản Lí Thuốc"
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

        {/* ── Vùng nội dung ─────────────────────────────────────────── */}
        <div className="flex-1 h-full flex flex-col overflow-hidden">
          <Search
            hideHeader={hideHeader}
            title={title}
            keyword={keyword}
            onSearch={(kw) => setKeyword(kw)}
          />
          <div className="flex-1 flex justify-center items-center overflow-hidden">
            <Outlet context={{ keyword, searchBatch: resolvedSearchBatch }} />
          </div>
        </div>
      </div>
    </div>
  );
}
