import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ShieldCheck } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f5f0] flex flex-col items-center justify-center text-[#3d2b1f] p-4 space-y-4">
      <div className="h-12 w-12 rounded-lg bg-[#ebe5d8] border border-[#c4a484]/50 flex items-center justify-center text-[#6f4e37]">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-[#6f4e37] font-mono">404</h1>
      <h2 className="text-base font-semibold text-[#3d2b1f]">Resource Not Found</h2>
      <p className="text-xs text-[#6f4e37]/80">The requested procurement portal resource could not be found.</p>
      <Link href="/dashboard">
        <Button variant="primary" size="sm">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
