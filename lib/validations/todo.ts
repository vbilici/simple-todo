import { z } from "zod";
const PRIORITY_VALUES = ["low", "medium", "high"] as const;

export const todoSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().nullish(),
  priority: z.enum(PRIORITY_VALUES, "Invalid priority value"),
  due_date: z.preprocess(
    date => date === "" ? null : date,
    z.iso.date("Invalid due date").nullish(), 
  ),
  parent_id: z.preprocess(
    id => id === "" ? null : id,
    z.uuid().nullish()
  ), 
  tags: z.array(z.string()).optional(),
  completed: z.boolean().optional()
});

export const updateTodoSchema = todoSchema.extend({
  id: z.uuid("Invalid todo ID"),
});