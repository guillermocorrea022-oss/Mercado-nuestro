import Link from "next/link";

// Layout minimal para pantallas de auth (sin Header / Footer completos).
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate flex min-h-screen flex-col bg-background">
      <div aria-hidden className="absolute inset-0 -z-10 bg-grain" />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -z-10 size-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl"
      />
      <header className="border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-base font-semibold tracking-tight"
          >
            <span
              aria-hidden
              className="inline-block size-2.5 rounded-full bg-primary"
            />
            <span>
              Mercado <span className="text-muted-foreground">Nuestro</span>
            </span>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        {children}
      </main>
    </div>
  );
}
