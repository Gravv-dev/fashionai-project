"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { createClient, isConfigured } from "@/lib/supabase";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { signOut } from "@/lib/services/auth";

// Navbar user prop accepts undefined; convert null to undefined

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!supabase || !isConfigured) {
      // In development without Supabase, allow access with a mock user
      setTimeout(() => {
        setLoading(false);
        setUser({ email: "demo@fashiontech.ai" });
      }, 0);
      return;
    }

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (event === "SIGNED_OUT") {
          router.push("/login");
        }
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase, isConfigured]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col lg:flex-row overflow-hidden">
      <Navbar
        user={user ?? undefined}
        onSignOut={handleSignOut}
        isAuthenticated={Boolean(user)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {!user && isConfigured ? (
          <div className="flex h-screen items-center justify-center bg-surface">
            <Card className="w-full max-w-md p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand text-text-inverse font-bold text-lg mb-6">
                <LogIn className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Please sign in
              </h2>
              <p className="text-text-muted mb-6">
                Access your FashionTech AI workspace
              </p>
              <Button className="w-full" onClick={() => router.push("/login")}>
                Go to sign in
              </Button>
            </Card>
          </div>
        ) : (
          <main className="flex-1 overflow-y-auto bg-surface p-6 lg:p-8">
            {children}
          </main>
        )}
      </div>
    </div>
  );
}
