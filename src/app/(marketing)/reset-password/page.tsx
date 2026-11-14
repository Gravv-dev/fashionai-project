"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Mail, Lock, ArrowRight } from "lucide-react";
import { resetPassword } from "@/lib/services/auth";
import { createClient } from "@/lib/supabase";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = React.useState(false);

  // Read token and type from URL search params during render
  const [token, type] = React.useMemo(() => {
    if (typeof window === "undefined") {
      return [null, null] as [string | null, string | null];
    }
    const params = new URLSearchParams(window.location.search);
    return [params.get("token"), params.get("type")] as [
      string | null,
      string | null,
    ];
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!supabase) {
      toast("Supabase not configured", {
        description: "Please set up Supabase environment variables.",
      });
      return;
    }
    if (!token) {
      toast("Invalid reset link", {
        description: "No reset token found in the URL.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await resetPassword(token, data.password);
      if (!result.success) {
        toast("Password reset failed", {
          description: result.error?.message,
        });
        return;
      }
      toast("Password updated", {
        description: "Your password has been changed successfully.",
      });
      router.push("/login");
    } catch (err) {
      toast("Password reset failed", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || type !== "recovery") {
    return (
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1">
          <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Invalid reset link</CardTitle>
                <CardDescription>
                  This password reset link is invalid or has expired.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-text-muted">
                  Please request a new password reset link.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" asChild>
                  <Link href="/forgot-password">Request new reset link</Link>
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
              <CardTitle className="text-2xl">Reset password</CardTitle>
              <CardDescription>
                Create a new password for your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-xs text-error">{errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-error">{errors.confirmPassword.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Resetting…" : "Reset password"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <p className="text-xs text-text-muted text-center">
                Already have a password?{" "}
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
