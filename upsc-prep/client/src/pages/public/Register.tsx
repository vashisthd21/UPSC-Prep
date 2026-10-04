import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetYear, setTargetYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await authService.register({
        name,
        email,
        password,
        targetYear: targetYear ? Number(targetYear) : undefined,
      });
      setAuth(token, user);
      showToast("Account created — let's get started", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5 py-16">
      <h1 className="font-serif text-2xl font-semibold text-ink dark:text-paper">Create your account</h1>
      <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">It takes less than a minute.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-1 text-xs text-ink/50 dark:text-paper/50">At least 8 characters.</p>
        </div>
        <div>
          <Label htmlFor="targetYear">Target exam year (optional)</Label>
          <Input
            id="targetYear"
            type="number"
            placeholder="2027"
            value={targetYear}
            onChange={(e) => setTargetYear(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60 dark:text-paper/60">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-maroon">
          Log in
        </Link>
      </p>
    </div>
  );
}
