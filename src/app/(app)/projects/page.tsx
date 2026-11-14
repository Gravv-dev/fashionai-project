"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProjectForm } from "@/components/shared/ProjectForm";
import { Folder, Shirt, Flag, Layers, MoreHorizontal, Trash2, Edit3 } from "lucide-react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/services/projects";
import type { Project } from "@/types/database";

const TYPE_LABELS: Record<string, string> = {
  tech_pack: "Tech Pack",
  flat_sketch: "Flat Sketch",
  line_sheet: "Line Sheet",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  tech_pack: Shirt,
  flat_sketch: Flag,
  line_sheet: Layers,
};

interface ProjectRowProps {
  project: Project;
  loading: boolean;
  deletingId: string | null;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

function ProjectRow({
  project,
  loading,
  deletingId,
  onEdit,
  onDelete,
}: ProjectRowProps) {
  const TypeIcon = TYPE_ICONS[project.type] || Folder;
  const isDeleting = deletingId === project.id;

  return (
    <tr key={project.id} className="hover:bg-surface/50 transition-colors">
      <td className="pb-4 pt-6 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface/50 text-text-secondary">
          <TypeIcon className="h-4 w-4" />
        </div>
        <div>
          <div className="font-medium text-text-primary">{project.name}</div>
          <div className="text-xs text-text-muted">
            {TYPE_LABELS[project.type] || project.type}
          </div>
        </div>
      </td>
      <td className="pb-4 pt-6 text-text-secondary">
        {TYPE_LABELS[project.type] || project.type}
      </td>
      <td className="pb-4 pt-6">
        <StatusBadge
          status={project.status as "draft" | "generating" | "ready" | "exported"}
        />
      </td>
      <td className="pb-4 pt-6 text-right text-text-muted">
        {new Date(project.updated_at).toLocaleDateString()}
      </td>
      <td className="pb-4 pt-6 text-right">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(project)}
            disabled={loading || isDeleting}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onDelete(project.id)}
            disabled={loading || isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [openForm, setOpenForm] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(
    null
  );
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProjects();
      if (result.success) {
        setProjects(result.data ?? []);
        setSuccess("Projects loaded successfully");
      } else {
        setError(result.error?.message || "Failed to load projects");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadProjects();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleCreate = () => {
    setEditingProject(null);
    setOpenForm(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setOpenForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }
    setDeletingId(id);
    try {
      const result = await deleteProject(id);
      if (result.success) {
        setProjects(projects.filter((p) => p.id !== id));
        setSuccess("Project deleted successfully");
      } else {
        setError(result.error?.message || "Failed to delete project");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSuccess = () => {
    setOpenForm(false);
    setEditingProject(null);
    loadProjects();
    setSuccess("Project saved successfully");
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === null || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ["draft", "generating", "ready", "exported"] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
          <p className="text-sm text-text-muted">
            Manage your tech packs, flat sketches, and line sheets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreate}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Folder className="h-4 w-4" /> New project
          </Button>
        </div>
      </div>

      {/* Error / Success messages */}
      {error && (
        <div className="rounded-md bg-error/10 p-4 border border-error/20">
          <p className="text-sm text-error">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadProjects}
            className="mt-3"
          >
            Try again
          </Button>
        </div>
      )}
      {success && (
        <div className="rounded-md bg-success/10 p-4 border border-success/20 mb-4">
          <p className="text-sm text-success">{success}</p>
        </div>
      )}

      {/* Search and filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Folder className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            id="search"
            placeholder="Search projects…"
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusFilter(null)}
            disabled={loading}
            className={statusFilter === null ? "bg-brand text-text-inverse" : ""}
          >
            All statuses
          </Button>
          {statuses.map((status) => (
            <Button
              key={status}
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter(status)}
              disabled={loading}
              className={
                statusFilter === status
                  ? "bg-brand text-text-inverse"
                  : ""
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-4">
            <div className="h-8 w-8 rounded-full border-4 border-brand border-t-transparent animate-spin" />
            <p className="text-sm text-text-muted">Loading projects…</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left pb-4 pt-6 font-medium text-text-muted">Project</th>
                <th className="text-left pb-4 pt-6 font-medium text-text-muted">Type</th>
                <th className="text-left pb-4 pt-6 font-medium text-text-muted">Status</th>
                <th className="text-right pb-4 pt-6 font-medium text-text-muted">Updated</th>
                <th className="text-right pb-4 pt-6 font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProjects.map((proj) => (
                <ProjectRow
                  key={proj.id}
                  project={proj}
                  loading={loading}
                  deletingId={deletingId}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center">
            {error ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <p className="text-sm text-error">{error}</p>
                <Button variant="outline" size="sm" onClick={loadProjects}>
                  Try again
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface mb-4">
                  <span className="h-6 w-6 text-text-muted">📁</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary">No projects yet</h3>
                <p className="mt-2 text-sm text-text-muted max-w-xs">
                  Create your first tech pack, flat sketch, or line sheet to get started.
                </p>
                <Button className="mt-6" onClick={handleCreate}>
                  Create Tech Pack
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Project form */}
      <ProjectForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={handleSuccess}
        editingProject={editingProject ?? undefined}
      />
    </div>
  );
}
