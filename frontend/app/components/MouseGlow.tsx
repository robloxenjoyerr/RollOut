"use client";

import { useEffect } from "react";

export default function MouseGlow() {
  useEffect(() => {
    const move = (e: MouseEvent) => {
      document.documentElement.style.setProperty(
        "--mouse-x",
        e.clientX + "px"
      );
      document.documentElement.style.setProperty(
        "--mouse-y",
        e.clientY + "px"
      );
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return null; // rendert nichts
}