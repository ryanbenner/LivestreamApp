"use client";

import { useEffect } from "react";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log("Client className:", document.documentElement.className);
  }, []);

  return <>{children}</>;
}
