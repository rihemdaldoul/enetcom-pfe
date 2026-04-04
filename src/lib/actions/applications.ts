"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getOpenProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      companies (name, industry, logo_url)
    `)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getProjectById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      companies (name, industry, logo_url, description)
    `)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getMyApplications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      projects (
        title, type, duration,
        companies (name, logo_url)
      )
    `)
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function applyToProject(projectId: string, coverLetter: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if already applied
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("student_id", user.id)
    .eq("project_id", projectId)
    .single();

  if (existing) return { error: "You have already applied to this project." };

  const { error } = await supabase.from("applications").insert({
    student_id: user.id,
    project_id: projectId,
    cover_letter: coverLetter,
    status: "pending",
  });

  if (error) return { error: error.message };

  revalidatePath("/student/applications");
  revalidatePath(`/student/projects/${projectId}`);
  return { success: true };
}

export async function getStudentStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { total: 0, pending: 0, accepted: 0, rejected: 0 };

  const { data } = await supabase
    .from("applications")
    .select("status")
    .eq("student_id", user.id);

  const apps = data ?? [];
  return {
    total: apps.length,
    pending: apps.filter(a => a.status === "pending").length,
    accepted: apps.filter(a => a.status === "accepted").length,
    rejected: apps.filter(a => a.status === "rejected").length,
  };
}