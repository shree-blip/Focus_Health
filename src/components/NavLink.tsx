"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className"> {
  to: string;
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  children?: ReactNode;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, to, children, ...props }, ref) => {
    const pathname = usePathname();
    const isActive = pathname === to;

    return (
      <Link
        ref={ref}
        href={to}
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
