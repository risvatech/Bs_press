"use client";

import { forwardRef, ReactNode } from "react";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";

interface NavLinkProps extends LinkProps {
    className?: string;
    activeClassName?: string;
    children?: ReactNode;
    exact?: boolean;
    href: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
    ({ className, activeClassName, href, exact = false, children, ...props }, ref) => {
        const pathname = usePathname();

        // Check if link is active
        const isActive = exact
            ? pathname === href
            : pathname.startsWith(href);

        return (
            <Link
                ref={ref}
                href={href}
                className={cn(className, isActive && activeClassName)}
                {...props}
            >
                {children}
            </Link>
        );
    },
);

NavLink.displayName = "NavLink";

export { NavLink };