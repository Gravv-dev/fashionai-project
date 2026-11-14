"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  User,
  SlidersHorizontal,
  Shield,
  Building2,
  RefreshCw,
} from "lucide-react";
import {
  getProfile,
  updateProfile,
  getSubscription,
} from "@/lib/services";

export default function SettingsPage() {
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    brandName: "",
    brandContact: "",
    sizingSystem: "CM",
    sizeRange: "XS to XL",
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [subscription, setSubscription] = React.useState<{
    plan_id: string;
    status: string;
    credits: number;
  } | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileResult, subscriptionResult] = await Promise.all([
        getProfile(),
        getSubscription(),
      ]);

      if (profileResult.success && profileResult.data) {
        const p = profileResult.data;
        setFormData({
          fullName: p.full_name || "",
          email: p.email || "",
          brandName: p.brand_name || "",
          brandContact: p.brand_contact || "",
          sizingSystem: p.sizing_system || "CM",
          sizeRange: p.size_range || "XS to XL",
        });
      }

      if (subscriptionResult.success && subscriptionResult.data) {
        setSubscription({
          plan_id: subscriptionResult.data.plan_id,
          status: subscriptionResult.data.status,
          credits: subscriptionResult.data.credits,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateProfile({
        full_name: formData.fullName || null,
        brand_name: formData.brandName || null,
        brand_contact: formData.brandContact || null,
        sizing_system: formData.sizingSystem as "CM" | "IN",
        size_range: formData.sizeRange || null,
      });

      if (!result.success) {
        setError(result.error?.message || "Failed to update profile");
        return;
      }

      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Error / Success messages */}
      {error && (
        <div className="rounded-md bg-error/10 p-4 border border-error/20 mb-4">
          <p className="text-sm text-error">{error}</p>
          <Button variant="outline" size="sm" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}
      {success && (
        <div className="rounded-md bg-success/10 p-4 border border-success/20 mb-4">
          <p className="text-sm text-success">{success}</p>
          <Button variant="outline" size="sm" onClick={() => setSuccess(null)}>
            Dismiss
          </Button>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-muted">
          Manage your account and workspace preferences.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="h-8 w-8 rounded-full border-4 border-brand border-t-transparent animate-spin" />
              <p className="text-sm text-text-muted">Loading profile…</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    defaultValue={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand name</Label>
                <Input
                  id="brandName"
                  placeholder="My Fashion Label"
                  defaultValue={formData.brandName}
                  onChange={(e) =>
                    setFormData({ ...formData, brandName: e.target.value })
                  }
                  disabled={saving}
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving…" : "Save Profile"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Brand defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Brand defaults
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="brandContact">Contact email</Label>
            <Input
              id="brandContact"
              type="email"
              placeholder="studio@example.com"
              defaultValue={formData.brandContact}
              onChange={(e) =>
                setFormData({ ...formData, brandContact: e.target.value })
              }
              disabled={saving}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sizingSystem">Sizing system</Label>
              <Input
                id="sizingSystem"
                defaultValue={formData.sizingSystem}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sizingSystem: e.target.value as "CM" | "IN",
                  })
                }
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sizeRange">Size range</Label>
              <Input
                id="sizeRange"
                placeholder="XS to XL"
                defaultValue={formData.sizeRange}
                onChange={(e) =>
                  setFormData({ ...formData, sizeRange: e.target.value })
                }
                disabled={saving}
              />
            </div>
          </div>
          <p className="text-xs text-text-muted">
            These defaults apply to new tech packs and flat sketches.
          </p>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-text-primary">
                {subscription?.plan_id ? subscription.plan_id.charAt(0).toUpperCase() + subscription.plan_id.slice(1) : "Starter"} plan
              </h3>
              <p className="text-sm text-text-muted">
                {subscription?.status || "Active"} · {subscription?.credits || 0} credits
              </p>
            </div>
            <Button asChild>
              <Link href="/pricing">Manage subscription</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-error">
            <Shield className="h-4 w-4 text-error" /> Danger zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button variant="destructive" size="sm" onClick={() => {}}>
            Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
