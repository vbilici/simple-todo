"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Todo, TodoActionState } from "@/types/todo";
import { todoSchema, updateTodoSchema } from "@/lib/validations/todo";

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

  const formDataObj = {
    ...Object.fromEntries(formData),
    tags: formData.getAll("tags"),
  };

  const result = todoSchema.safeParse(formDataObj);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".")} - ${issue.message}`)
      .join("; ");
    return { error: issues };
  }

  const validatedData = result.data;

  const { error, data } = await supabase
    .from("todos")
    .insert({
      user_id: user.id,
      title: validatedData.title,
      description: validatedData.description,
      priority: validatedData.priority,
      due_date: validatedData.due_date,
      parent_id: validatedData.parent_id,
      tags: validatedData.tags ?? [],
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

  const formDataObj = {
    ...Object.fromEntries(formData),
    tags: formData.getAll("tags"),
  };

  const result = updateTodoSchema.safeParse(formDataObj);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".")} - ${issue.message}`)
      .join("; ");
    return { error: issues };
  }

  const validatedData = result.data;


  const { error, data } = await supabase
    .from("todos")
    .update({
      title: validatedData.title,
      description: validatedData.description,
      priority: validatedData.priority,
      due_date: validatedData.due_date,
      parent_id: validatedData.parent_id,
      tags: validatedData.tags ?? [],
    })
    .eq("id", validatedData.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating todo:", error);
    return { error: "Could not update todo" };
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
