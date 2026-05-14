"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** "up" | "fade" | "scale" */
  variant?: "up" | "fade" | "scale";
};

export function AnimateIn({ children, delay = 0, className = "", variant = "up" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const base = "transition-all duration-700 ease-out will-change-transform";
  const hidden =
    variant === "fade"
      ? "opacity-0"
      : variant === "scale"
      ? "opacity-0 scale-95"
      : "opacity-0 translate-y-6";
  const shown = "opacity-100 translate-y-0 scale-100";

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${base} ${visible ? shown : hidden} ${className}`}
    >
      {children}
    </div>
  );
}
