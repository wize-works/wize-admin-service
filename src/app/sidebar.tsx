import SidebarCard from "./sidebar-card";

export default function Sidebar() {
  return (
    <div className="h-screen flex flex-col text-white p-5 shadow-md border-r border-white-100">
      <h1 className="text-xl font-bold mb-4">LOGO</h1>
      <div className="space-y-4">
        <SidebarCard title="Dashboard" href="/" />
        <SidebarCard
          title="Database Tools"
          href="/databases"
          activePaths={["/databases", "/tables", "/fields"]} // Keep active for these paths
        />
      </div>
    </div>
  );
}