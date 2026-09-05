"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Thiết kế gốc được canh chuẩn ở khung ngang 1475px. Từ 1280px (laptop) trở
// lên, "đúc" nguyên khối layout ở đúng tỉ lệ 1475px rồi phóng to/thu nhỏ
// bằng transform:scale — mọi thành phần cùng co giãn theo đúng 1 tỉ lệ,
// layout luôn giống hệt bản thiết kế gốc, không bị vỡ ở bất kỳ độ rộng nào.
// Dưới 1280px (tablet, mobile) giữ nguyên layout responsive thật (không đúc
// khối) vì thu nhỏ nguyên khối xuống dưới mốc đó sẽ làm chữ quá nhỏ để đọc.
const DESIGN_WIDTH = 1475;
const FREEZE_FROM = 1280;

export default function DesktopFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [wrapperHeight, setWrapperHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el || isAdmin) return;

    function recompute() {
      if (!el) return;
      const vw = window.innerWidth;
      const nextScale = vw >= FREEZE_FROM ? vw / DESIGN_WIDTH : 1;
      setScale(nextScale);
      setWrapperHeight(nextScale === 1 ? undefined : el.offsetHeight * nextScale);
    }

    recompute();
    const resizeObserver = new ResizeObserver(recompute);
    resizeObserver.observe(el);
    window.addEventListener("resize", recompute);
    return () => {
      window.removeEventListener("resize", recompute);
      resizeObserver.disconnect();
    };
  }, [isAdmin]);

  const isFrozen = !isAdmin && scale !== 1;

  return (
    <div style={isFrozen ? { height: wrapperHeight, overflow: "hidden" } : undefined}>
      <div
        ref={innerRef}
        className={className}
        style={
          isFrozen
            ? { width: DESIGN_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
