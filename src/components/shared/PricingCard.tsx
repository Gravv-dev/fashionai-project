"use client";

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";

interface PricingCardProps {
  name: string;
  description: string;
  monthly: number;
  annual: number;
  credits?: number;
  features: readonly string[];
  popular?: boolean;
  href: string;
  buttonLabel: string;
  disabled?: boolean;
}

export function PricingCard({
  name,
  description,
  monthly,
  annual,
  credits,
  features,
  popular = false,
  href,
  buttonLabel,
  disabled = false,
}: PricingCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col rounded-2xl border p-6 transition-all",
        popular
          ? "border-brand bg-brand/5 shadow-lg"
          : "border-border bg-card hover:border-border/50 hover:shadow-md"
      )}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-6 items-center rounded-full bg-brand px-2 text-xs font-bold text-text-inverse">
          <Crown className="h-3 w-3 mr-1" /> Most popular
        </div>
      )}
      <h3 className="mb-2 text-lg font-semibold text-text-primary">{name}</h3>
      <p className="mb-6 text-sm text-text-muted">{description}</p>
      <div className="mb-6 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-text-primary">${monthly}</span>
        <span className="text-sm text-text-muted">/mo</span>
        {credits && (
          <span className="text-xs text-text-muted ml-2">({credits} credits)</span>
        )}
      </div>
      <p className="text-xs text-text-muted">
        Billed annually at ${annual}/yr
      </p>
      <ul className="flex flex-col gap-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className="h-4 w-4 flex-shrink-0 text-success mt-0.5" />
            <span className="text-sm text-text-secondary">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        disabled={disabled}
        className="w-full"
        variant={popular ? "brand" : "default"}
      >
        {buttonLabel}
      </Button>
    </Link>
  );
}
