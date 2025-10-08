import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <main className="max-w-2xl w-full text-center space-y-8">
        {/* App Name and Tagline */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            Cop Event Logger
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground">
            Real-time event logging for law enforcement
          </p>
        </div>

        {/* Brief Description */}
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
          A mobile-first application for officers to log daily activities, with admin oversight for department-wide data management and reporting.
        </p>

        {/* Login CTA */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
          <Link
            href="/login"
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 font-medium text-base px-8 py-3 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium text-base px-8 py-3 transition-all w-full sm:w-auto"
          >
            Sign Up
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full py-6">
        <div className="text-center text-sm text-muted-foreground">
          © 2025 Cop Event Logger
        </div>
      </footer>
    </div>
  );
}
