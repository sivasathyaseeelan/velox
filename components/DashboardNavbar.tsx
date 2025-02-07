"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ConnectWallet from "./connect";
import { useEffect, useState } from "react"
import axios from "axios";

const DashboardNavbar = () => {
  const pathname = usePathname();

  return (
    <nav className="w-full text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Title */}
        <h1 className="text-5xl font-bold">velox</h1>

        {/* Navigation Links */}
        <div className="flex space-x-6">
          <NavLink href="/dashboard" pathname={pathname}>
            Overview
          </NavLink>
          <NavLink href="/dashboard/deposits" pathname={pathname}>
            Deposits
          </NavLink>
          <NavLink href="/dashboard/trades" pathname={pathname}>
            Trades
          </NavLink>
          <ConnectWallet />
        </div>
      </div>
    </nav>
  );
};

// Reusable NavLink Component
const NavLink = ({
  href,
  pathname,
  children,
}: {
  href: string;
  pathname: string;
  children: React.ReactNode;
}) => {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg ${
        pathname === href ? "bg-blue-500" : "hover:bg-gray-700"
      }`}
    >
      {children}
    </Link>
  );
};

export default DashboardNavbar;