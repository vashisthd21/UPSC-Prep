import { useEffect, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { adminService } from "@/services/adminService";
import { User } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.listUsers(1, 50, search);
      setUsers(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function changeRole(id: string, role: "student" | "admin") {
    try {
      await adminService.updateUserRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
      showToast("Role updated", "success");
    } catch {
      showToast("Could not update role", "error");
    }
  }

  async function removeUser(id: string) {
    if (id === currentUser?.id) {
      showToast("You cannot delete your own account", "error");
      return;
    }
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      showToast("Could not delete user", "error");
    }
  }

  return (
    <div className="px-5 py-8 md:px-8">
      <h1 className="font-serif text-2xl font-semibold text-ink dark:text-paper">User Management</h1>

      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="relative mt-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={16} />
        <Input placeholder="Search by name or email..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </form>

      <div className="mt-6">
        {loading ? (
          <FullPageSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <Card className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-ink/10 dark:border-paper/10 text-left text-ink/50 dark:text-paper/50">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-ink/5 dark:border-paper/5 last:border-0">
                    <td className="px-5 py-3 text-ink dark:text-paper">{u.name}</td>
                    <td className="px-5 py-3 text-ink/70 dark:text-paper/70">{u.email}</td>
                    <td className="px-5 py-3">
                      <Select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value as "student" | "admin")}
                        className="w-32 py-1.5"
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </Select>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => removeUser(u.id)} className="text-ink/40 hover:text-danger"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
