"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowRight } from "lucide-react";
import { requestPasswordReset } from "@/lib/services/auth";
import { createClient } from "@/lib/supabase";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const supabase = createClient();
  const [isLoading, setIsLoading] = React.useState(false);
  const [resetRequested, setResetRequested] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (!supabase) {
      toast("Supabase not configured", {
        description: "Please set up Supabase environment variables.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await requestPasswordReset(data.email);
      if (!result.success) {
        toast("Reset request failed", {
          description: result.error?.message,
        });
        return;
      }
      setResetRequested(true);
      toast("Reset email sent", {
        description: result.data?.message || "Check your inbox for instructions.",
      });
    } catch (err) {
      toast("Reset request failed", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (resetRequested) {
    return (
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1">
          <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Reset email sent</CardTitle>
                <CardDescription>
                  Check your inbox for a password reset link.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-text-muted">
                  The reset link will allow you to create a new password.
                  If you don’t see the email, check your spam folder.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      <main className="flex-1">
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Forgot password</CardTitle>
              <CardDescription>
                Enter your email to receive a password reset link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-xs text-error">{errors.email.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending…" : "Send reset email"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <p className="text-xs text-text-muted text-center">
                Remember your password?{" "}
                <Link href="/login" className="text-brand font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
