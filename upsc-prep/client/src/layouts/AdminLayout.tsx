import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, HelpCircle, FileText, Users, BarChart3, LogOut, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";

const links = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/questions", label: "Questions", icon: HelpCircle },
  { to: "/admin/tests", label: "Tests", icon: FileText },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/analytics", label: "Platform Analytics", icon: BarChart3 },
];

export function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper dark:bg-ink md:flex">
      <aside className="md:w-64 border-b md:border-b-0 md:border-r border-ink/10 dark:border-paper/10 flex flex-col">
        <div className="px-5 py-5">
          <p className="font-serif text-lg font-semibold text-ink dark:text-paper">Admin Panel</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-1 flex items-center gap-1 text-xs text-ink/50 hover:text-ink dark:text-paper/50"
          >
            <ArrowLeft size={12} /> Back to student view
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
                  isActive ? "bg-maroon/10 text-maroon" : "text-ink/70 hover:bg-ink/5 dark:text-paper/70 dark:hover:bg-paper/10"
                )
              }
            >
              <l.icon size={17} />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4">
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-ink/70 hover:bg-danger/10 hover:text-danger dark:text-paper/70"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
