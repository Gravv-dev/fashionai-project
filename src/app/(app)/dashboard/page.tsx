"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  LayoutDashboard,
  Shirt,
  Flag,
  Layers,
  Folder,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { ProgressStep } from "@/components/shared/ProgressStep";
import {
  getProjects,
  getTechPacks,
  getFlatSketches,
  getLineSheets,
} from "@/lib/services";


export default function DashboardPage() {
  const [projects, setProjects] = React.useState<
    Array<{
      id: string;
      name: string;
      type: string;
      status: string;
      updated_at: string;
    }>
  >([]);
  const [stats, setStats] = React.useState({
    totalProjects: 0,
    totalTechPacks: 0,
    totalFlatSketches: 0,
    totalLineSheets: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        projectsResult,
        techPacksResult,
        flatSketchesResult,
        lineSheetsResult,
      ] = await Promise.all([
        getProjects(),
        getTechPacks(),
        getFlatSketches(),
        getLineSheets(),
      ]);

      if (projectsResult.success) {
        setProjects(
          (projectsResult.data ?? []).map((p) => ({
            id: p.id,
            name: p.name,
            type: p.type,
            status: p.status,
            updated_at: p.updated_at,
          }))
        );
        setStats({
          totalProjects: projectsResult.data?.length ?? 0,
          totalTechPacks: techPacksResult.success
            ? techPacksResult.data?.length ?? 0
            : 0,
          totalFlatSketches: flatSketchesResult.success
            ? flatSketchesResult.data?.length ?? 0
            : 0,
          totalLineSheets: lineSheetsResult.success
            ? lineSheetsResult.data?.length ?? 0
            : 0,
        });
      } else {
        setError(projectsResult.error?.message || "Failed to load dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const QUICK_ACTIONS = [
    {
      name: "Tech Pack Generator",
      href: "/techpack",
      icon: <Shirt className="h-5 w-5" />,
      desc: "Create a new tech pack from a garment reference.",
    },
    {
      name: "Flat Sketch Generator",
      href: "/flatsketch",
      icon: <Flag className="h-5 w-5" />,
      desc: "Generate a flat sketch from a garment photo.",
    },
    {
      name: "Line Sheet Studio",
      href: "/line-sheet",
      icon: <Layers className="h-5 w-5" />,
      desc: "Build a collection review sheet from saved sketches.",
    },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-muted">
            Overview of your fashion tech workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/techpack">
              Create tech pack
            </Link>
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-md bg-error/10 p-4 border border-error/20">
          <p className="text-sm text-error">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="mt-3"
          >
            Try again
          </Button>
        </div>
      )}

      {/* Stats */}
      {!loading && (
        <div className="grid md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Projects",
              value: stats.totalProjects,
              icon: <Folder className="h-5 w-5" />,
              change: "All project types",
            },
            {
              label: "Tech Packs",
              value: stats.totalTechPacks,
              icon: <Shirt className="h-5 w-5" />,
              change: "Ready for production",
            },
            {
              label: "Flat Sketches",
              value: stats.totalFlatSketches,
              icon: <Flag className="h-5 w-5" />,
              change: "Generated sketches",
            },
            {
              label: "Line Sheets",
              value: stats.totalLineSheets,
              icon: <Layers className="h-5 w-5" />,
              change: "Collection reviews",
            },
          ].map((stat) => (
            <Card key={stat.label} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium text-text-muted">
                    {stat.label}
                  </CardTitle>
                  <span className="text-xs text-text-muted">{stat.change}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface text-text-muted">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-text-primary">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 hover:border-brand/50 hover:shadow-md transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
              {action.icon}
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">{action.name}</h3>
              <p className="text-sm text-text-muted">{action.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-text-muted" />
          </Link>
        ))}
      </div>

      {/* Recent projects */}
      <div className="flex flex-col">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Recent projects</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/projects">View all</Link>
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center gap-4">
              <div className="h-8 w-8 rounded-full border-4 border-brand border-t-transparent animate-spin" />
              <p className="text-sm text-text-muted">Loading projects…</p>
            </div>
          ) : projects.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left pb-3 pt-4 font-medium text-text-muted">Project</th>
                  <th className="text-left pb-3 pt-4 font-medium text-text-muted">Type</th>
                  <th className="text-left pb-3 pt-4 font-medium text-text-muted">Status</th>
                  <th className="text-right pb-3 pt-4 font-medium text-text-muted">Updated</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 5).map((proj) => (
                  <tr key={proj.id} className="border-b border-border last:border-0">
                    <td className="pb-3 pt-4 font-medium text-text-primary">{proj.name}</td>
                    <td className="pb-3 pt-4 text-text-secondary">{proj.type.replace("_", " ")}</td>
                    <td className="pb-3 pt-4">
                      <StatusBadge
                        status={proj.status as "draft" | "generating" | "ready" | "exported"}
                      />
                    </td>
                    <td className="pb-3 pt-4 text-right text-text-muted">
                      {new Date(proj.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface mb-4">
                <span className="h-6 w-6 text-text-muted">📁</span>
              </div>
              <h3 className="text-lg font-semibold text-text-primary">No projects yet</h3>
              <p className="mt-2 text-sm text-text-muted max-w-xs">
                Create your first tech pack, flat sketch, or line sheet to get started.
              </p>
              <Button className="mt-6" asChild>
                <a href="/techpack">Create Tech Pack</a>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Workflow progress */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Your workflow</h2>
        <ProgressStep
          currentStep={3}
          totalSteps={4}
          labels={["Reference", "Setup", "Generate", "Export"]}
        />
      </div>
    </div>
  );
}
