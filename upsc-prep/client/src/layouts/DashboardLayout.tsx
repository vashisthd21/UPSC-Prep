import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  History,
  BarChart3,
  Bookmark,
  User as UserIcon,
  LogOut,
  Moon,
  Sun,
  Menu,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mock-tests", label: "Mock Tests", icon: FileText },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/history", label: "History", icon: History },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: UserIcon },
];

export function DashboardLayout() {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2 px-5 py-5 font-serif text-lg font-semibold text-ink dark:text-paper">
        <ScrollText size={20} className="text-maroon" />
        UPSC Prep
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
                isActive
                  ? "bg-maroon/10 text-maroon"
                  : "text-ink/70 hover:bg-ink/5 dark:text-paper/70 dark:hover:bg-paper/10"
              )
            }
          >
            <l.icon size={17} />
            {l.label}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
                isActive ? "bg-maroon/10 text-maroon" : "text-ink/70 hover:bg-ink/5 dark:text-paper/70 dark:hover:bg-paper/10"
              )
            }
          >
            <ShieldCheck size={17} />
            Admin Panel
          </NavLink>
        )}
      </nav>
      <div className="border-t border-ink/10 dark:border-paper/10 px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink dark:text-paper">{user?.name}</p>
            <p className="truncate text-xs text-ink/50 dark:text-paper/50">{user?.email}</p>
          </div>
          <button onClick={toggleTheme} className="rounded p-1.5 text-ink/50 hover:bg-ink/5 dark:text-paper/50 dark:hover:bg-paper/10">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
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
    </>
  );

  return (
    <div className="min-h-screen bg-paper dark:bg-ink md:flex">
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-ink/10 md:dark:border-paper/10">
        {sidebarContent}
      </aside>

      <div className="md:hidden flex items-center justify-between border-b border-ink/10 dark:border-paper/10 px-4 py-3">
        <span className="font-serif font-semibold text-ink dark:text-paper">UPSC Prep</span>
        <button onClick={() => setMobileOpen(true)} className="text-ink dark:text-paper">
          <Menu size={22} />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-paper dark:bg-ink shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
