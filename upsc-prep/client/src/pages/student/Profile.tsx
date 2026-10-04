import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";

export function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  const fields = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Role", value: user.role === "admin" ? "Administrator" : "Student" },
    { label: "Target Exam Year", value: user.targetYear || "Not set" },
    { label: "Optional Subject", value: user.optionalSubject || "Not set" },
  ];

  return (
    <div className="px-5 py-8 md:px-8">
      <h1 className="font-serif text-2xl font-semibold text-ink dark:text-paper">Profile</h1>
      <Card className="mt-6 max-w-xl">
        <CardHeader><h2 className="font-serif text-base font-semibold text-ink dark:text-paper">Account Details</h2></CardHeader>
        <CardBody>
          <dl className="divide-y divide-ink/10 dark:divide-paper/10">
            {fields.map((f) => (
              <div key={f.label} className="flex items-center justify-between py-3 text-sm">
                <dt className="text-ink/60 dark:text-paper/60">{f.label}</dt>
                <dd className="font-medium text-ink dark:text-paper">{f.value}</dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>
    </div>
  );
}
