"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PricingCard } from "@/components/shared/PricingCard";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const [annual, setAnnual] = React.useState(false);
  const plans = [
    {
      name: "Starter",
      description: "Flat sketches for occasional styles.",
      monthly: 25,
      annual: 250,
      credits: 20,
      features: [
        "Unlimited flat sketches",
        "Front and back views",
        "Editable SVG export",
        "Standard support",
      ],
      href: "/signup",
      buttonLabel: "Start free",
    },
    {
      name: "Professional",
      description: "Tech packs and flat sketches for growing teams.",
      monthly: 75,
      annual: 720,
      credits: 50,
      features: [
        "Unlimited tech packs and flat sketches",
        "Measurements, BOM, artwork, construction",
        "Illustrator Connect and factory sharing",
        "Licensed color matching",
        "Max Mode included",
      ],
      popular: true,
      href: "/signup",
      buttonLabel: "Start free trial",
    },
    {
      name: "Enterprise",
      description: "Custom PLM/ERP for established brands.",
      monthly: 0,
      annual: 0,
      features: [
        "Custom PLM and ERP integrations",
        "API access and webhooks",
        "Team management and central billing",
        "Custom onboarding and support",
      ],
      href: "/pricing#enterprise",
      buttonLabel: "Contact sales",
      disabled: true,
    },
  ] as const;

  const credits = [
    {
      name: "Flat sketch",
      price: 7,
      credits: 7,
      desc: "Front, back, and editable SVG.",
    },
    {
      name: "Tech pack",
      price: 20,
      credits: 20,
      desc: "Create or unlock a tech pack with downloads.",
    },
  ] as const;

  return (
    <div className="flex flex-col flex-1">
      <Navbar />

      <main className="flex-1">
        <section className="px-4 pt-20 pb-24 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">
                Simple, transparent pricing
              </h1>
              <p className="mt-4 text-lg text-text-secondary">
                Memberships for ongoing work. One-time credits for occasional styles.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 mb-16">
              <span className="text-sm text-text-secondary">Monthly</span>
              <button
                onClick={() => setAnnual(!annual)}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-input bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                aria-checked={annual}
                role="switch"
              >
                <span className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow ring-0 transition-transform ${annual ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className="text-sm text-text-secondary">Annual · Save 20%</span>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.name}
                  {...plan}
                  monthly={annual ? Math.round(plan.monthly * 0.8) : plan.monthly}
                  annual={annual ? plan.annual : plan.monthly * 12}
                />
              ))}
            </div>

            {/* Credits section */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-text-primary mb-8">Credits — Pay as you go</h2>
              <p className="mb-8 text-sm text-text-secondary max-w-2xl mx-auto">
                1 credit = $1. Credits never expire. Add 7, 20, 50, or 100 credits.
                The same balance works for both flat sketches and tech packs.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mx-auto max-w-xl">
                {credits.map((c) => (
                  <div key={c.name} className="rounded-xl border border-border bg-card p-6">
                    <h3 className="text-sm font-semibold text-text-primary">{c.name}</h3>
                    <div className="mt-2 mb-4 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-text-primary">${c.price}</span>
                      <span className="text-sm text-text-muted">{c.credits} credits</span>
                    </div>
                    <p className="text-xs text-text-muted mb-4">{c.desc}</p>
                    <Button className="w-full" variant="outline" asChild>
                      <Link href="/signup">Get started</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16">
              <h2 className="text-2xl font-bold text-text-primary mb-8">Questions about pricing.</h2>
              <div className="space-y-3 max-w-2xl mx-auto">
                {[
                  "Do I need a membership?",
                  "How many seats can I buy online?",
                  "How do credits work?",
                  "Do credits expire?",
                  "What does a tech pack purchase include?",
                ].map((q) => (
                  <details key={q} className="border-b border-border pb-4 last:border-0">
                    <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-text-secondary hover:text-brand">
                      <span>{q}</span>
                      <span className="text-text-muted">▾</span>
                    </summary>
                    <p className="mt-3 text-sm text-text-muted">
                      {q === "Do I need a membership?"
                        ? "No. Buy one-time credits for occasional flat sketches or tech packs."
                        : q === "How many seats can I buy online?"
                          ? "Buy 1–5 seats online. For 6 or more, choose Enterprise."
                          : q === "How do credits work?"
                            ? "Each credit costs $1. A flat sketch uses 7 credits ($7), and a tech pack uses 20 credits ($20)."
                            : q === "Do credits expire?"
                              ? "No. Credits never expire."
                              : "Use 20 credits to create a tech pack or unlock one you have already started."}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
