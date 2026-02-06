"use client";
import { useState, ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content area with proper left margin for desktop */}
            <div className="lg:ml-64 flex flex-col min-h-screen">
                <Header onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}