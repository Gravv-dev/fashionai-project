import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FeatureCard } from "@/components/shared/FeatureCard";
import {
  Shirt,
  Flag,
  Layers,
  Play,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col flex-1">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative px-4 pt-20 pb-32 lg:px-8 lg:pt-32 lg:pb-48 overflow-hidden">
          <div className="mx-auto max-w-7xl">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-medium text-brand mb-6">
                <span className="relative flex h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                Beta access now open
              </div>
              <h1 className="mt-2 mb-6 text-4xl lg:text-6xl font-bold text-text-primary tracking-tight leading-tight">
                Clean, editable tech packs <br />
                and flat sketches for fashion brands.
              </h1>
              <p className="mb-8 text-lg text-text-secondary max-w-2xl lg:max-w-xl">
                Generate the first draft from a garment reference, define your
                specs and materials, and export factory-ready files—all in one
                workflow built for Illustrator and PLM.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <Link href="/signup">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Start free trial
                    </span>
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                  <Link href="/pricing">
                    See pricing
                  </Link>
                </Button>
              </div>
              <p className="mt-6 text-xs text-text-muted">
                No credit card required · Cancel anytime
              </p>
            </div>
          </div>
        </section>

        {/* Feature overview */}
        <section className="px-4 pb-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">
                One system. Your workflow.
              </h2>
              <p className="mt-4 text-lg text-text-secondary">
                Generate the techpack, edit, and export into files you already use in production.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                number="01"
                title="Flat Sketch Generation"
                description="Generate clean front and back flat sketches from a garment reference."
                image={<div className="absolute -right-6 -top-6 w-48 h-32 bg-surface rounded-lg border border-border opacity-50"><Flag className="h-12 w-12 text-text-muted mx-auto mt-4" /></div>}
                href="/flatsketch"
              />
              <FeatureCard
                number="02"
                title="Tech Pack Creation"
                description="Create an editable pack with measurements, BOM, construction notes, and production details."
                image={<div className="absolute -right-6 -top-6 w-48 h-32 bg-surface rounded-lg border border-border opacity-50"><Shirt className="h-12 w-12 text-text-muted mx-auto mt-4" /></div>}
                href="/techpack"
              />
              <FeatureCard
                number="03"
                title="Line Sheet Studio"
                description="Turn saved flat sketches into product options, compare colors and materials, and export a PDF."
                image={<div className="absolute -right-6 -top-6 w-48 h-32 bg-surface rounded-lg border border-border opacity-50"><Layers className="h-12 w-12 text-text-muted mx-auto mt-4" /></div>}
                href="/line-sheet"
              />
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section className="px-4 pb-32 lg:px-8 bg-surface">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary">
                From reference to export
              </h2>
              <p className="mt-4 text-lg text-text-secondary">
                Four steps to a factory-ready tech pack.
              </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {[
                {
                  num: "01",
                  title: "Start with a reference",
                  desc: "Upload a garment photo, sketch, or flat as your source of truth.",
                },
                {
                  num: "02",
                  title: "Define specs and materials",
                  desc: "List measurements, size range, BOM items, trims, artwork, and labels.",
                },
                {
                  num: "03",
                  title: "Review like a factory",
                  desc: "Check callouts, stitch notes, and materials before sampling.",
                },
                {
                  num: "04",
                  title: "Export and share",
                  desc: "Send a clean PDF or Excel file to your factory.",
                },
              ].map((step, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-text-inverse text-sm font-bold">
                    {step.num}
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-24 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-border bg-card p-8 lg:p-12 text-center">
              <h2 className="text-2xl font-bold text-text-primary">Ready to start?</h2>
              <p className="mt-4 text-lg text-text-secondary">
                Generate your first draft. Review it. Export when ready.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <Link href="/signup">Start free trial</Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                  <Link href="/pricing">See pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
