import { useState, useEffect } from "react";

// Scale theo chiều rộng màn hình — Scale by screen width to always fill horizontally
const BASE_WIDTH = 1920;

export function useViewportScale() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function calcScale() {
      // Chỉ tính theo width → luôn full chiều ngang
      // Width-only scaling → always fills horizontal space
      const s = window.innerWidth / BASE_WIDTH;
      setScale(Math.min(1, Math.max(0.4, s)));
    }
    calcScale();
    window.addEventListener("resize", calcScale);
    return () => window.removeEventListener("resize", calcScale);
  }, []);

  return scale;
}
