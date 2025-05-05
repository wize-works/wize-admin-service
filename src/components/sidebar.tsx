"use client";

import SidebarCard from "./sidebar-card";
import Image from "next/image"; // Import the Image component

export default function Sidebar() {

  return (
    <div className="h-screen flex flex-col p-5 space-y-4 border-r-2 border-white">
      {/* Sidebar Header */}
      <div className="mb-6 flex flex-col items-center">
        {/* Add a row for the logo and text */}
        <div className="flex items-center space-x-4">
          <Image src="/logo.png" alt="Logo" width={50} height={50} />
           <div className="text-center">
            <span className="text-2xl font-bold">
            <span className="color-primary">Job</span>
            <span className="color-secondary">Sight</span>
            </span>
          <p className="text-sm font-bold">Admin</p>
        </div>
      </div>
    </div>

      {/* Sidebar Content */}
      <SidebarCard title="Dashboard" href="/" />
      <SidebarCard title="Databases" href="/databases" activePaths={["/databases", "/tables", "/fields"]} />
    </div>
  );
}