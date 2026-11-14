"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Mail,
  Link as ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV_LINKS = [
  { name: "Workspaces", href: "/" },
  { name: "Pricing", href: "/pricing" },
] as const;

const DROPDOWN_ITEMS = [
  { name: "Tech Pack Generator", href: "/techpack" },
  { name: "Flat Sketch Generator", href: "/flatsketch" },
  { name: "Line Sheet Studio", href: "/line-sheet" },
] as const;

const SOCIAL_LINKS = [
  { name: "Instagram", href: "https://www.instagram.com/", icon: <ExternalLink className="h-4 w-4" /> },
  { name: "TikTok", href: "https://www.tiktok.com/", icon: <ExternalLink className="h-4 w-4" /> },
  { name: "YouTube", href: "https://www.youtube.com/", icon: <ExternalLink className="h-4 w-4" /> },
] as const;

export function Navbar({
  user,
  onSignOut,
  isAuthenticated,
}: {
  user?: { email?: string };
  onSignOut?: () => void;
  isAuthenticated?: boolean;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-blur]:bg-background/80">
      <div className="flex h-16 shrink-0 items-center gap-4 border-b border-border px-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-text-inverse font-bold text-lg">
            FT
          </div>
          <span className="font-semibold text-text-primary tracking-tight">
            FashionTech AI
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="ml-8 hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-brand transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <DropdownMenu
            open={isUserMenuOpen}
            onOpenChange={setIsUserMenuOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Workspaces <span className="ml-2 text-xs opacity-50">▾</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {DROPDOWN_ITEMS.map((item) => (
                <DropdownMenuItem key={item.name} asChild>
                  <Link href={item.href}>{item.name}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/pricing">Pricing ↗</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          {!user ? (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                {user.email?.split("@")[0] || "Account"}
                <span className="ml-2 text-xs opacity-50">▾</span>
              </Button>
              <DropdownMenu
                open={isUserMenuOpen}
                onOpenChange={setIsUserMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Settings
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Account settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onSignOut?.();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden flex items-center justify-center p-2 text-text-secondary hover:bg-surface rounded-md"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-4">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-text-secondary hover:text-brand"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3">
            {!user ? (
              <>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/signup">Get started</Link>
                </Button>
              </>
            ) : (
              <Button className="w-full" variant="outline" asChild>
                <Link href="/settings">Account settings</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function DropdownMenuSeparator() {
  return <Separator orientation="vertical" className="my-1" />;
}
