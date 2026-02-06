"use client";
import {
    ChevronRight,
    Menu,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../ui/button";
import api from "../../service/api";


interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {

    const [openMenu, setOpenMenu] = useState(false);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout"); // call backend to clear cookie
            window.location.href = "/cms"; // redirect after logout
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-6">
                <div className="flex items-center">
                    <button
                        onClick={onMenuClick}
                        className="text-gray-400 hover:text-gray-600 lg:hidden"
                        data-testid="button-hamburger-menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <nav className="ml-6 lg:ml-0">
                        <ol className="flex items-center space-x-2 text-sm">
                            <li>
                                <a
                                    // href="/"
                                    className="text-gray-500 hover:text-gray-700"
                                    data-testid="link-breadcrumb-home"
                                >
                                </a>
                            </li>
                            <li>
                                <ChevronRight className="text-gray-300 w-3 h-3" />
                            </li>
                            <li
                                className="text-gray-900 font-medium"
                                data-testid="text-breadcrumb-current"
                            >
                            </li>
                        </ol>
                    </nav>
                </div>

                <div className="flex items-center space-x-4">

                    <Button onClick={handleLogout}>
                        Log Out
                    </Button>
                </div>
            </div>
        </header>
    );
}