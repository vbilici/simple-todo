export interface Todo {
  id: string;
  user_id: string;
  parent_id: string | null;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  due_date: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type TodoWithChildren = Todo & { children: TodoWithChildren[] };

export type TodoActionState = {
  success?: boolean;
  todo?: Todo;
  error?: string;
} | null;

export const TODO_FORM_MODE = {
  CREATE: "create",
  UPDATE: "update",
} as const;

type TODO_FORM_MODE = (typeof TODO_FORM_MODE)[keyof typeof TODO_FORM_MODE];

export type UpsertTodoFormProps = {
  mode?: TODO_FORM_MODE;
  todo?: Todo;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: React.ReactNode;
};