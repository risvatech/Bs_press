"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
    ChevronDown,
    ChevronRight,
    Shield,
    Book,
    Mail,
    X,
    File,
    LucideIcon,
    Users,
    UserCog,
    Box,
    UserCheck, FileText,
} from "lucide-react";
import Image from "next/image"
import Logo from "@/public/assets/risva.png";

interface SubMenuItem {
    name: string;
    href: string;
    icon: LucideIcon;
    module: string;
}

interface NavigationItem {
    name: string;
    href: string;
    icon: LucideIcon;
    module: string;
    submenu?: SubMenuItem[];
}

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const adminItems: NavigationItem[] = [
    {
        name: "Users & Roles",
        href: "#", // Added required href property
        icon: Users,
        module: "admin",
        submenu: [
            { name: "Users", href: "/cms/users", icon: UserCog, module: "users" },
            { name: "Permissions", href: "/cms/permissions", icon: Shield, module: "permissions" },
            { name: "Roles", href: "/cms/roles", icon: UserCheck, module: "roles" },
        ],
    },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const isAdmin = true;

    const navigationItems: NavigationItem[] = [
        // { name: "Products", href: "/cms/products", icon: Box, module: "products",
        //     submenu: [
        //         { name: "Product List", href: "/cms/products", icon: Box, module: "products" },
        //         { name: "Category", href: "/cms/products/category", icon: Shield, module: "products Category" },
        //     ],},
        { name: "Enquiry", href: "/cms/enquiry", icon: Mail, module: "enquiry" },
        { name: "Quotes", href: "/cms/quotes", icon: FileText, module: "Quotes" },

        // {
        //     name: "Pallets",
        //     href: "#", // Added required href property
        //     icon: File,
        //     module: "Pallets",
        //     submenu: [
        //         { name: "Pallet List", href: "/cms/pallet-packaging", icon: File, module: "Pallets" },
        //         { name: "Category", href: "/cms/pallet-packaging/category", icon: Shield, module: "Category" },
        //     ],
        // }
    ];

    const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

    const toggleSubmenu = (itemName: string) => {
        const newExpanded = new Set(expandedMenus);
        if (newExpanded.has(itemName)) newExpanded.delete(itemName);
        else newExpanded.add(itemName);
        setExpandedMenus(newExpanded);
    };

    const renderNavigationItem = (item: NavigationItem) => {
        const isActive =
            pathname === item.href ||
            (item.submenu && item.submenu.some((sub) => pathname === sub.href));
        const isExpanded = expandedMenus.has(item.name);
        const Icon = item.icon;

        return (
            <div key={item.name}>
                {item.submenu ? (
                    <>
                        <button
                            onClick={() => toggleSubmenu(item.name)}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                isActive
                                    ? "bg-primary-50 text-primary-700 border border-primary-200"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            {item.name}
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4 ml-auto" />
                            ) : (
                                <ChevronRight className="w-4 h-4 ml-auto" />
                            )}
                        </button>
                        {isExpanded && (
                            <div className="ml-6 mt-2 space-y-1">
                                {item.submenu.map((subItem) => {
                                    const isSubActive = pathname === subItem.href;
                                    const SubIcon = subItem.icon;
                                    return (
                                        <Link
                                            key={subItem.name}
                                            href={subItem.href}
                                            className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                                                isSubActive
                                                    ? "bg-primary-50 text-primary-700 border border-primary-200"
                                                    : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                            onClick={() => window.innerWidth < 1024 && onClose()}
                                        >
                                            <SubIcon className="w-5 h-5 mr-3" />
                                            {subItem.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <Link
                        href={item.href}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                            isActive
                                ? "bg-primary-50 text-primary-700 border border-primary-200"
                                : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => window.innerWidth < 1024 && onClose()}
                    >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.name}
                    </Link>
                )}
            </div>
        );
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <span className="ml-2 text-xl text-primary font-medium">BS Press</span>
                    </div>
                    <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="mt-6 px-4 h-full overflow-y-auto pb-20">
                    <div className="space-y-2">
                        {navigationItems.map(renderNavigationItem)}
                    </div>

                    {isAdmin && (
                        <div className="mt-8">
                            <div className="px-4 mb-2">
                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Administration
                                </span>
                            </div>
                            <div className="space-y-2">
                                {adminItems.map(renderNavigationItem)}
                            </div>
                        </div>
                    )}
                </nav>
            </div>
        </>
    );
}