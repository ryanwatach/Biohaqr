import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-lg tracking-tight">
          BioHaqr
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 hidden sm:block">{user.email}</span>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <nav className="border-b border-gray-800 px-6 flex gap-6">
        {[
          { href: "/dashboard", label: "Stack Log" },
          { href: "/dashboard/bloodwork", label: "Bloodwork" },
          { href: "/dashboard/biomarkers", label: "Biomarkers" },
          { href: "/dashboard/correlations", label: "Correlations" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-sm text-gray-400 hover:text-white py-3 transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
