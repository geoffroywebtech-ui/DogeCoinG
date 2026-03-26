import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-petoo-50 via-white to-teal-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl w-fit">
          <span className="text-3xl">🐾</span>
          <span className="gradient-text">Petoo</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-500">
        © 2026 Petoo · Fait avec ❤️ en France
      </footer>
    </div>
  );
}
