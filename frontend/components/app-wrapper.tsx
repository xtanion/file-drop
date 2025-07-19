"use client";

import { useUsername } from "@/hooks/use-username";
import { WebSocketProvider } from "@/context/ws-context";

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const username = useUsername();

  return (
    <>
      {username && <WebSocketProvider username={username}>{children}</WebSocketProvider>}
    </>
  );
}