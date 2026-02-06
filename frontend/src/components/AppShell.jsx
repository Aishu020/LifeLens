import React from "react";
import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import FloatingAssistant from "./FloatingAssistant";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-hero grain">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-aurora opacity-70" />
        <div className="relative z-10">
          <TopBar />
          <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:px-8">
            <Outlet />
          </main>
          <BottomNav />
          <FloatingAssistant />
        </div>
      </div>
    </div>
  );
}
