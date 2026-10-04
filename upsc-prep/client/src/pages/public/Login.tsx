import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || "/dashboard";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await authService.login({ email, password });
      setAuth(token, user);
      showToast(`Welcome back, ${user.name.split(" ")[0]}`, "success");
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5 py-16">
      <h1 className="font-serif text-2xl font-semibold text-ink dark:text-paper">Log in</h1>
      <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">Continue your Prelims preparation.</p>

      <div className="mt-4 rounded-md border border-gold/30 bg-gold/5 px-3 py-2 text-xs text-ink/70 dark:text-paper/70">
        Demo accounts (after running the seed script): <br />
        <span className="font-mono">student@upscprep.local</span> /{" "}
        <span className="font-mono">admin@upscprep.local</span> — password{" "}
        <span className="font-mono">ChangeMe123!</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60 dark:text-paper/60">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-maroon">
          Sign up
        </Link>
      </p>
    </div>
  );
}
