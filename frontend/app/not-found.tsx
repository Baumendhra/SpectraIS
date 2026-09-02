import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4 space-y-4">
      <h1 className="text-4xl font-bold text-blue-400">404</h1>
      <h2 className="text-lg font-semibold text-slate-200">Page Not Found</h2>
      <p className="text-xs text-slate-400">The requested procurement resource could not be found.</p>
      <Link href="/dashboard">
        <Button variant="primary" size="sm">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
