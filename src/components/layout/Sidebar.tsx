"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Shirt,
  Flag,
  Layers,
  Folder,
  SlidersHorizontal,
  Mail,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    name: "Tech Pack Generator",
    href: "/techpack",
    icon: <Shirt className="h-5 w-5" />,
  },
  {
    name: "Flat Sketch Generator",
    href: "/flatsketch",
    icon: <Flag className="h-5 w-5" />,
  },
  {
    name: "Line Sheet Studio",
    href: "/line-sheet",
    icon: <Layers className="h-5 w-5" />,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: <Folder className="h-5 w-5" />,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: <SlidersHorizontal className="h-5 w-5" />,
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-background/50 backdrop-blur-md flex lg:flex">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-text-inverse font-bold text-lg">
          FT
        </div>
        <span className="font-semibold text-text-primary tracking-tight">
          FashionTech AI
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${isActive
                  ? "bg-brand text-text-inverse"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface"}
              `}
            >
              {item.icon}
              {item.name}
              {isActive && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full text-sm"
          asChild
        >
          <a href="/settings">
            <Mail className="h-4 w-4 mr-2" /> Account settings
          </a>
        </Button>
      </div>
    </aside>
  );
}
