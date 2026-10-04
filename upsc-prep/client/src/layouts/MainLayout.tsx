import { Link, NavLink, Outlet } from "react-router-dom";
import { Moon, Sun, ScrollText, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { to: "/mock-tests", label: "Mock Tests" },
  { to: "/pyqs", label: "PYQs" },
  { to: "/practice", label: "Practice" },
  { to: "/about", label: "About" },
];

export function MainLayout() {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-ink">
      <header className="border-b border-ink/10 dark:border-paper/10 bg-paper/95 dark:bg-ink/95 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2 font-serif text-lg font-semibold text-ink dark:text-paper">
            <ScrollText size={22} className="text-maroon" />
            UPSC Prelims Practice
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-maroon" : "text-ink/70 hover:text-ink dark:text-paper/70 dark:hover:text-paper"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-md p-2 text-ink/60 hover:bg-ink/5 dark:text-paper/60 dark:hover:bg-paper/10"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isAuthenticated ? (
              <Button size="sm" onClick={() => (window.location.href = "/dashboard")}>
                Dashboard
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-ink dark:text-paper" onClick={() => setOpen((o) => !o)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-ink/10 dark:border-paper/10 px-5 py-4 flex flex-col gap-3">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium text-ink dark:text-paper">
                {l.label}
              </NavLink>
            ))}
            <div className="flex gap-3 pt-2">
              {isAuthenticated ? (
                <Link to="/dashboard" className="w-full"><Button size="sm" className="w-full">Dashboard</Button></Link>
              ) : (
                <>
                  <Link to="/login" className="w-1/2"><Button variant="outline" size="sm" className="w-full">Log in</Button></Link>
                  <Link to="/register" className="w-1/2"><Button size="sm" className="w-full">Sign up</Button></Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink/10 dark:border-paper/10 py-8">
        <div className="mx-auto max-w-6xl px-5 text-sm text-ink/50 dark:text-paper/50 flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} UPSC Prelims Practice. Built for serious aspirants.</span>
          <span>Not affiliated with the Union Public Service Commission.</span>
        </div>
      </footer>
    </div>
  );
}
