import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
      <p className="font-serif text-6xl font-semibold text-maroon">404</p>
      <h1 className="mt-3 font-serif text-xl font-semibold text-ink dark:text-paper">Page not found</h1>
      <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-6"><Button>Back to home</Button></Link>
    </div>
  );
}
