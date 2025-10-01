import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-bold text-xl text-foreground">Service Call</div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors px-3 py-2"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm px-5 py-2 transition-all shadow-sm hover:shadow-md"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground">
              Complete Every <span className="text-primary">Service Call</span> On Time
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10">
              Stay organized with managed checklists that ensure nothing gets missed.
              Streamline your service operations and maintain consistency across your team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link
                href="/signup"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 font-medium text-base px-8 py-3 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium text-base px-8 py-3 transition-all w-full sm:w-auto"
              >
                Log In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-secondary/50 py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
              <div className="text-center">
                <div className="mb-4 text-4xl text-primary">✓</div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Never Miss a Step</h3>
                <p className="text-muted-foreground text-sm">
                  Custom checklists ensure consistent, quality service every time
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 text-4xl">⏱️</div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Stay On Schedule</h3>
                <p className="text-muted-foreground text-sm">
                  Track progress and completion in real-time to meet deadlines
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 text-4xl">👥</div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Built for Teams</h3>
                <p className="text-muted-foreground text-sm">
                  Share templates and maintain standards across your organization
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 text-4xl">📱</div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Access Anywhere</h3>
                <p className="text-muted-foreground text-sm">
                  Mobile-responsive interface perfect for field work
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Ready to stay on time?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join teams who never miss a service call deadline.
            </p>
            <Link
              href="/signup"
              className="inline-block rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 font-medium text-base px-8 py-3 transition-all shadow-md hover:shadow-lg"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 Service Call. All rights reserved.
            </div>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
