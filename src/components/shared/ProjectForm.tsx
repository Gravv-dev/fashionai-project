"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  createProject,
  updateProject,
  getProject,
} from "@/lib/services/projects";
import { createClient } from "@/lib/supabase";
import type { Project, ProjectInsert, ProjectUpdate } from "@/types/database";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional().or(z.literal("")),
  type: z.enum(["tech_pack", "flat_sketch", "line_sheet"]),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingProject?: Project;
}

export function ProjectForm({
  open,
  onClose,
  onSuccess,
  editingProject,
}: ProjectFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [initialDataLoaded, setInitialDataLoaded] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setTimeout(() => {
          setUserId(user?.id ?? null);
        }, 0);
      });
    }
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "tech_pack",
    },
  });

  // Load existing project data when editing
  React.useEffect(() => {
    if (editingProject && !initialDataLoaded) {
      reset({
        name: editingProject.name,
        description: editingProject.description ?? "",
        type: editingProject.type,
      });
      setTimeout(() => {
        setInitialDataLoaded(true);
      }, 0);
    }
    if (!editingProject) {
      setTimeout(() => {
        setInitialDataLoaded(false);
      }, 0);
    }
  }, [editingProject, initialDataLoaded, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingProject) {
        const updates: ProjectUpdate = {
          name: data.name,
          description: data.description || null,
          type: data.type,
        };
        const result = await updateProject(editingProject.id, updates);
        if (!result.success) {
          setError(result.error?.message || "Failed to update project");
          return;
        }
        setSuccess("Project updated successfully");
      } else {
        if (!userId) {
          setError("User not authenticated");
          return;
        }
        const insert: ProjectInsert = {
          user_id: userId,
          name: data.name,
          description: data.description || null,
          type: data.type,
        };
        const result = await createProject(insert);
        if (!result.success) {
          setError(result.error?.message || "Failed to create project");
          return;
        }
        setSuccess("Project created successfully");
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button>{editingProject ? "Edit Project" : "Create Project"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingProject ? "Edit Project" : "Create New Project"}
          </DialogTitle>
          <DialogDescription>
            {editingProject
              ? "Update your project details."
              : "Start a new tech pack, flat sketch, or line sheet project."}
          </DialogDescription>
        </DialogHeader>
        <Card className="p-0 mt-4">
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Summer Collection 2026"
                  {...register("name")}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-xs text-error">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of this project"
                  {...register("description")}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Project Type</Label>
                <Input
                  id="type"
                  type="select"
                  {...register("type")}
                  disabled={isLoading}
                >
                  <option value="tech_pack">Tech Pack</option>
                  <option value="flat_sketch">Flat Sketch</option>
                  <option value="line_sheet">Line Sheet</option>
                </Input>
              </div>
              {error && (
                <div className="rounded-md bg-error/10 p-3 border border-error/20">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}
              {success && (
                <div className="rounded-md bg-success/10 p-3 border border-success/20">
                  <p className="text-sm text-success">{success}</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving…" : "Save Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectForm;
