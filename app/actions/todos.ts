"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Todo, TodoActionState } from "@/types/todo";

export async function getTodos(): Promise<Todo[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching todos:", error);
    return [];
  }
  return data || [];
}

export async function createTodo(
  prevState: TodoActionState,
  formData: FormData
): Promise<{ success?: boolean; todo?: Todo; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  const title = formData.get("title") as string;

  if (!title) {
    return { error: "Title is required" };
  }

  const description = formData.get("description") as string;
  const cleanDescription = description.trim() === "" ? null : description;

  const priority = formData.get("priority") as "low" | "medium" | "high";

  if (!["low", "medium", "high"].includes(priority)) {
    return { error: "Invalid priority value" };
  }

  const due_date = formData.get("due_date") as string | null;
  if (due_date && isNaN(Date.parse(due_date))) {
    return { error: "Invalid due date" };
  }

  const parent_id = formData.get("parent_id") as string | null;
  const cleanParentId = parent_id && parent_id.trim() === "" ? null : parent_id;

  const tags = formData.getAll("tags") as string[];

  const { error, data } = await supabase
    .from("todos")
    .insert({
      user_id: user.id,
      title,
      description: cleanDescription,
      priority,
      due_date: due_date || null,
      parent_id: cleanParentId || null,
      tags,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating todo:", error);
    return { error: "Could not create todo" };
  }

  revalidatePath("/my-todos");

  return { success: true, todo: data };
}

export async function updateTodo(
  prevState: TodoActionState,
  formData: FormData
): Promise<{ success?: boolean; todo?: Todo; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  const id = formData.get("id") as string;
  if (!id) {
    return { error: "ID is required" };
  }

  const title = formData.get("title") as string;
  if (!title) {
    return { error: "Title is required" };
  }

  const description = formData.get("description") as string;
  const cleanDescription = description.trim() === "" ? null : description;

  const priority = formData.get("priority") as "low" | "medium" | "high";
  if (!["low", "medium", "high"].includes(priority)) {
    return { error: "Invalid priority value" };
  }

  const due_date = formData.get("due_date") as string | null;
  if (due_date && isNaN(Date.parse(due_date))) {
    return { error: "Invalid due date" };
  }

  const parent_id = formData.get("parent_id") as string | null;
  const cleanParentId = parent_id && parent_id.trim() === "" ? null : parent_id;
  const tags = formData.getAll("tags") as string[];

  const { error, data } = await supabase
    .from("todos")
    .update({
      title,
      description: cleanDescription,
      priority,
      due_date: due_date || null,
      parent_id: cleanParentId || null,
      tags,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating todo:", error);
    return {error: "Could not update todo"};
  }
  revalidatePath("/my-todos");

  return { success: true, todo: data };
}

export async function toggleTodo(
  id: string,
  completed: boolean
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Could not toggle todo");
  }
  revalidatePath("/my-todos");
}

export async function deleteTodo(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting todo:", error);
    throw new Error("Could not delete todo");
  }
  revalidatePath("/my-todos");
}
