"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "~/components/ui/button";

export default function HomePage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const toggleLabel = useMemo(() => {
    if (!mounted) return "Toggle theme";
    return resolvedTheme === "dark"
      ? "Switch to light mode"
      : "Switch to dark mode";
  }, [mounted, resolvedTheme]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground transition-colors">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16 text-center">
        <Button
          variant="outline"
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          disabled={!mounted}
        >
          {toggleLabel}
        </Button>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Your <span className="text-primary">React</span> App
        </h1>
        <p className="max-w-xl text-base text-muted-foreground">
          Toggle between light and dark themes to preview how the assistant UI
          adapts to your brand colors.
        </p>
      </div>
    </main>
  );
}
