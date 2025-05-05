"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarCardProps {
  title: string;
  href: string;
  activePaths?: string[]; // Optional array of paths to keep the card active
}

export default function SidebarCard({ title, href, activePaths = [] }: SidebarCardProps) {
  const pathname = usePathname(); // Get the current route

  // Check if the current route matches the href or any of the activePaths
  const isActive = pathname === href || activePaths.some((path) => pathname.startsWith(path));

  return (
    <Link href={href}>
      <div
        className={`p-4 rounded-lg shadow-md cursor-pointer ${
          isActive ? "bg-blue-500 text-white" : "bg-slate-400 text-gray-800"
        }`}
      >
        {title}
      </div>
    </Link>
  );
}